/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import Root from '../000-root';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');
jest.mock('react-router', () => ({
  BrowserRouter: require('./mockComponent')('BrowserRouter'),
  Match: require('./mockComponent')('Match'),
  Miss: require('./mockComponent')('Miss'),
}));
jest.mock('../010-app', () => require('./mockComponent')('App'));
jest.mock('../200-largeMessage', () => require('./mockComponent')('LargeMessage'));

describe('Root', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <Root />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
