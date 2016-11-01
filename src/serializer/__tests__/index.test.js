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

  it('should correctly serialize childless components', () => {
    const obj = {
      $$typeof: Symbol.for('react.test.json'),
      type: 'div',
    };
    expect(prettyFormat(obj, { plugins: [serialize] })).toMatchSnapshot();
  });
});
