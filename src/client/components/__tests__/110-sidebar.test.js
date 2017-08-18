/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import Sidebar from '../110-sidebar';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

describe('Sidebar', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Sidebar
          title="Title"
          subtitle="Subtitle"
          linkBack="link/to/parent/folder"
        >
          {['one', 'two']}
        </Sidebar>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly without linkBack', () => {
    const tree = renderer
      .create(
        <Sidebar title="Title" subtitle="Subtitle">
          {['one', 'two']}
        </Sidebar>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
