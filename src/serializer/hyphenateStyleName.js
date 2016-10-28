// @flow

const MS_PATTERN = /^ms-/;
const UPPERCASE_PATTERN = /([A-Z])/g;

const hyphenate = (str: string) =>
  str.replace(UPPERCASE_PATTERN, '-$1').toLowerCase();

const hyphenateStyleName = (str: string) =>
  hyphenate(str).replace(MS_PATTERN, '-ms-');

export default hyphenateStyleName;
