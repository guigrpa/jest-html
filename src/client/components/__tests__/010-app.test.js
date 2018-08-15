/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import App, { socketDisconnect } from '../010-app';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');
jest.mock('../015-appContents', () =>
  require('./mockComponent')('AppContents')
);

describe('App', () => {
  beforeEach(() => {
    require('whatwg-fetch');
  });

  it('renders correctly', () => {
    const match = {
      path: '/',
      url: '/',
      params: {},
    };
    const tree = renderer.create(<App match={match} location={{}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  afterEach(() => {
    socketDisconnect();
  });
});
