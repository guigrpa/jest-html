/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import Preview from '../120-preview';
import { SNAPSHOT_WITH_NO_HTML, SNAPSHOT_WITH_HTML } from './fixtures';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');
jest.mock('react-frame-component', () => require('./mockComponent')('Frame'));

describe('Preview', () => {
  it('renders correctly with no snapshot', () => {
    const tree = renderer.create(<Preview />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with non-HTML snapshot', () => {
    const tree = renderer
      .create(<Preview snapshot={SNAPSHOT_WITH_NO_HTML} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with HTML snapshot', () => {
    const tree = renderer
      .create(<Preview snapshot={SNAPSHOT_WITH_HTML} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
