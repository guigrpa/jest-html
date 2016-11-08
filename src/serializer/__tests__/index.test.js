/* eslint-env jest */
import prettyFormat from 'pretty-format';

import * as serialize from '../';

describe('Serializer', () => {
  it('should correctly discard non-React components', () => {
    expect(serialize.test({})).toBeFalsy();
    expect(serialize.test(undefined)).toBeFalsy();
    expect(serialize.test(null)).toBeFalsy();
    expect(serialize.test(true)).toBeFalsy();
    expect(serialize.test(false)).toBeFalsy();
    expect(serialize.test('abc')).toBeFalsy();
  });

  it('should correctly detect React components', () => {
    const comp = {
      $$typeof: Symbol.for('react.test.json'),
    };
    expect(serialize.test(comp)).toBeTruthy();
  });

  it('should correctly serialize React components', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
      props: {
        a: 3,
        b: 'foo',
        c: true,
        d: false,
        className: 'my-class',
        htmlFor: 'bar',
        style: {
          flexDirection: 'row',
          margin: 3,
          border: '1px solid blue',
          padding: 2,
          sth: undefined,
        },
      },
      children: ['Text', 5],
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize Textareas', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'textarea',
      props: {
        value: 'One block\nof text\nwith accents: áéíóú',
        style: null,
      },
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize self-closing elements', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
      children: [
        { type: 'span' },
        { type: 'br' },
        {
          type: 'img',
          props: { src: 'foo.png' },
        },
        { type: 'span' },
      ],
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize elements with zero props', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize elements with one prop', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
      props: { foo: 'bar' },
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize elements with several props but only one valid one', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
      props: { yes: true, no: false },
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize childless components', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });

  it('should correctly serialize divs with whiteSpace: pre style', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
      children: [
        { type: 'span', children: ['A normal span'] },
        {
          type: 'div',
          props: {
            foo: 'bar',
            foo2: 'bar2',
            style: { whiteSpace: 'pre' },
          },
          children: [
            'A div without whiteSpace:',
            { type: 'span', props: { a: '3', b: '4' }, children: ['ABC'] },
            {
              type: 'span',
              props: { a: true },
              children: ['DEF\nGHI'],
            },
            {
              type: 'span',
              props: { a: true },
              children: [
                'JKL',
                { type: 'span', children: ['MNO'] },
              ],
            },
          ],
        },
        { type: 'span', children: ['Another normal span'] },
      ],
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });
});
