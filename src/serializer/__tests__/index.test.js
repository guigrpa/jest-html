/* eslint-env jest */
import prettyFormat from 'pretty-format';
import React from 'react';
import renderer from 'react-test-renderer';

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
    const tree = renderer.create(
      <div a={3} b="foo" c d={false}>Text</div>
    ).toJSON();
    expect(prettyFormat(tree, { plugins: [serialize] })).toMatchSnapshot();
  });
});
