/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import { _SidebarItem as SidebarItem, SidebarGroup } from '../115-sidebarItem';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

describe('SidebarItem', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <SidebarItem
          id="one"
          label="an/extremely/amazingly/ultra/hyper/really/very/long/label"
          icon="folder-o"
          link="some/url"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when hovered', () => {
    const tree = renderer
      .create(
        <SidebarItem
          id="two"
          label="two"
          icon="folder-o"
          link="some/url"
          hovering="two"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when selected', () => {
    const tree = renderer
      .create(
        <SidebarItem
          id="three"
          label="three"
          icon="folder-o"
          link="some/url"
          fSelected
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when selected & hovered', () => {
    const tree = renderer
      .create(
        <SidebarItem
          id="four"
          label="four"
          icon="folder-o"
          link="some/url"
          hovering="four"
          fSelected
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('SidebarGroup', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <SidebarGroup name="Snapshot group name">
          {['one', 'two']}
        </SidebarGroup>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
