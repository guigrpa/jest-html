// @flow

// import printString from 'pretty-format/printString';
import escapeHtml from 'escape-html';
import { merge } from 'timm';
import hyphenateStyleName from './hyphenateStyleName';

const reactTestInstance = Symbol.for('react.test.json');
const HTML_PREVIEW_SEPARATOR = '------------HTML PREVIEW---------------';

// From React: src/renderers/dom/shared/HTMLDOMPropertyConfig.js
const REACT_PROPS_TO_DOM_ATTRS = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
};

// Adapted from React: src/renderers/dom/shared/CSSProperty.js
const IS_UNITLESS_NUMBER = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridColumn: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
};
Object.keys(IS_UNITLESS_NUMBER).forEach((prop) => {
  ['Webkit', 'ms', 'Moz', 'O'].forEach((prefix) => {
    const styleName = prefix + prop.charAt(0).toUpperCase() + prop.substring(1);
    IS_UNITLESS_NUMBER[styleName] = IS_UNITLESS_NUMBER[prop];
  });
});

const SELF_CLOSING = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
};

function test(object: any) {
  return object && !object.__visited && object.$$typeof === reactTestInstance;
}

function printMain(val: Object, print: Function, indent: Function, opts: Object) {
  const val2 = merge(val, {
    __visited: true,
    $$typeof: reactTestInstance,
  });  // break infinite recursion
  const snapContents = print(val2, print, indent, opts);
  const htmlContents = printInstance(val, print, indent, opts);
  return `${snapContents}\n${HTML_PREVIEW_SEPARATOR}\n${htmlContents}`;
}

function printInstance(instance, print, indent, opts) {
  if (typeof instance === 'number') return print(instance);
  if (typeof instance === 'string') return escapeHtml(instance);

  let result = `<${instance.type}`;

  const filteredProps = filterProps(instance.props);
  const numProps = Object.keys(filteredProps).length;
  result += printProps(filteredProps, print, indent, opts);
  if (numProps > 1) result += opts.edgeSpacing;
  result += '>';

  if (SELF_CLOSING[instance.type]) return result;

  const children = instance.children;
  if (children) {
    const printedChildren = printChildren(children, print, indent, opts);
    result += `${opts.edgeSpacing}${indent(printedChildren)}` +
      `${opts.edgeSpacing}</${instance.type}>`;
  } else if (instance.type.toUpperCase() === 'TEXTAREA') {
    result += `${(escapeHtml(instance.props.value) || '')}` +
      `</${instance.type}>`;
  } else if (numProps <= 1) {
    result += `</${instance.type}>`;
  } else {
    result += `${opts.edgeSpacing}</${instance.type}>`;
  }

  return result;
}

function filterProps(props = {}) {
  const out = {};
  Object.keys(props).forEach((name) => {
    const val = props[name];
    if (val == null) return;
    if (typeof val === 'string' || name === 'style' || val === true) {
      out[name] = val;
    }
  });
  return out;
}

function printProps(props, print, indent, opts) {
  const numProps = Object.keys(props).length;
  /* eslint-disable prefer-template */
  const wrapProp = numProps <= 1
    ? (name, val) => ` ${name}` + (val === undefined ? '' : `=${val}`)
    : (name, val) => opts.spacing + indent(name) + (val === undefined ? '' : `=${val}`);
  /* eslint-enable prefer-template */
  return Object.keys(props).sort().map((propName) => {
    const propValue = props[propName];
    if (propValue == null) return '';

    let printedValue;
    if (typeof propValue === 'string') {
      printedValue = print(propValue);
    } else if (propName === 'style') {
      printedValue = printStyle(propValue, print);
    } else if (propValue === true) {
      printedValue = undefined;
    } else {
      return '';
    }

    let printedName = propName;
    if (REACT_PROPS_TO_DOM_ATTRS[propName]) {
      printedName = REACT_PROPS_TO_DOM_ATTRS[propName];
    }
    if (propValue === true) return wrapProp(printedName);
    return wrapProp(printedName, printedValue);
  }).join('');
}

function printStyle(style, print) {
  if (style == null) {
    return '';
  }

  let css = '';
  Object.keys(style).sort().forEach((styleName) => {
    const styleValue = style[styleName];
    if (styleValue === undefined) return;
    css += hyphenateStyleName(styleName);
    css += ':';
    css += printStyleValue(styleName, styleValue);
    css += ';';
  });

  return print(css);
}

// From React: src/renderers/dom/shared/dangerousStyleValue.js
function printStyleValue(name, value) {
  if (value == null || typeof value === 'boolean' || value === '') return '';
  if (typeof value === 'number' && value !== 0 && !IS_UNITLESS_NUMBER[name]) {
    return `${value}px`; // Presumes implicit 'px' suffix for unitless numbers
  }
  return String(value).trim();
}

function printChildren(children, print, indent, opts) {
  return children.map((child) => printInstance(child, print, indent, opts))
    .join(opts.edgeSpacing);
}

export {
  test,
  printMain as print,
  HTML_PREVIEW_SEPARATOR,
};
