/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import AppContents from '../015-appContents';
import {
  FOLDER_WITH_SUBFOLDERS_AND_SUITES,
  FOLDER_WITH_SUBFOLDERS,
  FOLDER_WITH_SUITES,
  ROOT_FOLDER,
  SUITE_WITH_INDIVIDUAL_SNAPSHOTS,
  SUITE_WITH_GROUPS_AND_INDIVIDUAL_SNAPSHOTS,
} from './fixtures';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');
jest.mock('react-router', () => ({
  Redirect: require('./mockComponent')('Redirect'),
}));
jest.mock('../110-sidebar', () => require('./mockComponent')('Sidebar'));
jest.mock('../115-sidebarItem', () => {
  const mock = require('./mockComponent')('SidebarItem');
  mock.SidebarGroup = require('./mockComponent')('SidebarGroup');
  return mock;
});
jest.mock('../120-preview', () => require('./mockComponent')('Preview'));
jest.mock('../200-largeMessage', () => require('./mockComponent')('LargeMessage'));

describe('AppContents', () => {
  beforeEach(() => { require('whatwg-fetch'); });

  it('can redirect to root if needed', () => {
    const tree = renderer.create(
      <AppContents
        fRedirectToRoot
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders error messages', () => {
    const tree = renderer.create(
      <AppContents
        error="Something horrible!"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a spinner while loading', () => {
    const tree = renderer.create(
      <AppContents
        error={null}
        fetchedItem={null}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a folder with subfolders correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="FOLDER"
        fetchedItem={FOLDER_WITH_SUBFOLDERS}
        fetchedItemPath="-/path/to/snapshots"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a folder with suites correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="FOLDER"
        fetchedItem={FOLDER_WITH_SUITES}
        fetchedItemPath="-/path/to/snapshots"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a folder with subfolders and suites correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="FOLDER"
        fetchedItem={FOLDER_WITH_SUBFOLDERS_AND_SUITES}
        fetchedItemPath="-/path/to/snapshots"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders the root folder correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="FOLDER"
        fetchedItem={ROOT_FOLDER}
        fetchedItemPath="-"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a suite with individual snapshots correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="SUITE"
        fetchedItem={SUITE_WITH_INDIVIDUAL_SNAPSHOTS}
        fetchedItemPath="-/path/to/folder/suite1.js.snap"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a suite with grouped snapshots correctly', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="SUITE"
        fetchedItem={SUITE_WITH_GROUPS_AND_INDIVIDUAL_SNAPSHOTS}
        fetchedItemPath="-/path/to/folder/suite1.js.snap"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a suite with a selected snapshot', () => {
    const tree = renderer.create(
      <AppContents
        fetchedItemType="SUITE"
        fetchedItem={SUITE_WITH_GROUPS_AND_INDIVIDUAL_SNAPSHOTS}
        fetchedItemPath="-/path/to/folder/suite1.js.snap"
        query={{ id: 'individual1 1' }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
