/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

const Component = () => (
  <div style={{}}>
    <b>Hello</b> there
  </div>
);

describe('Sample', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Component />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
