// @flow

/* eslint-env browser */
import React from 'react';
import { Redirect } from 'react-router';
import {
  Floats,
  Spinner, Icon, Button,
  flexContainer,
} from 'giu';
import type {
  FolderT,
  SnapshotSuiteT,
} from '../../common/types';
import Sidebar from './110-sidebar';
import SidebarItem, { SidebarGroup } from './115-sidebarItem';
import Preview from './120-preview';
import LargeMessage from './200-largeMessage';

require('./010-app.sass');

// const breakAtSlashes = (str) => str.replace(/\//g, '/\u200B');
const breakAtDots = (str) => str.replace(/\./g, '.\u200B');
const lastSegment = (path) => {
  if (!path) return '';
  const segments = path.split('/');
  return segments[segments.length - 1];
};
const snapshotName = (id) => {
  const segments = id.split(' ');
  return segments.slice(0, segments.length - 1).join(' ');
};

const _escape = (str) => encodeURIComponent(str);

// ==========================================
// Component declarations
// ==========================================
type SidebarTypeT = 'FOLDER' | 'SUITE';
type PropsT = {
  fetchedItemType: ?SidebarTypeT,
  fetchedItem: ?(FolderT | SnapshotSuiteT),
  fetchedItemPath: ?string,
  error: ?string,
  onRedirectToRoot: () => void;
  fRedirectToRoot: boolean,
  query: ?Object,
};

// ==========================================
// Component
// ==========================================
class AppContents extends React.PureComponent {
  props: PropsT;

  render() {
    if (this.props.fRedirectToRoot) {
      return <Redirect to="/" />;
    }
    if (this.props.error) {
      return (
        <LargeMessage>
          <Icon icon="warning" disabled />{' '}<b>An error occurred:</b><br />
          {this.props.error}<br />
          <Button
            onClick={this.props.onRedirectToRoot}
          >
            <Icon icon="home" disabled />{' '}Home
          </Button>
        </LargeMessage>
      );
    }
    if (!this.props.fetchedItem) {
      return <LargeMessage><Spinner />&nbsp;Loading…</LargeMessage>;
    }
    return (
      <div style={style.outer}>
        <Floats />
        {this.renderSidebar()}
        {this.renderPreview()}
      </div>
    );
  }

  renderSidebar() {
    const fFolder = this.props.fetchedItemType === 'FOLDER';
    const { fetchedItemPath } = this.props;
    const { contents, linkBack } = fFolder ? this.renderFolder() : this.renderSuite();
    let title;
    if (fFolder) {
      const folder: FolderT = (this.props.fetchedItem: any);
      title = folder.parentFolderPath != null
      ? <span>
          <Icon icon="folder-open-o" style={style.titleBarIcon} />&nbsp;
          {lastSegment(fetchedItemPath)}
        </span>
      : <span>
          <Icon icon="home" style={style.titleBarIcon} />&nbsp;Root
        </span>;
    } else {
      title = (
        <span>
          <Icon icon="file-o" style={style.titleBarIcon} />&nbsp;
          {lastSegment(fetchedItemPath).split('.')[0]}
        </span>
      );
    }
    return (
      <Sidebar title={title} subtitle={fetchedItemPath} linkBack={linkBack}>
        {contents}
      </Sidebar>
    );
  }

  renderFolder() {
    const folder: FolderT = (this.props.fetchedItem: any);
    const contents = [];
    folder.childrenFolderPaths.forEach((folderPath) => {
      const id = `folder_${folderPath}`;
      let label = folderPath;
      const tmpIndex = label.indexOf(`${folder.folderPath}/`);
      if (tmpIndex >= 0) label = label.slice(folder.folderPath.length + 1);
      label = breakAtDots(label);
      contents.push(
        <SidebarItem
          key={id}
          id={id}
          label={label}
          link={`/folder/${_escape(folderPath)}`}
          icon="folder-o"
          fSelected={false}
        />
      );
    });
    folder.filePaths.forEach((filePath) => {
      const id = `suite_${filePath}`;
      let label = filePath;
      const tmpIndex = label.indexOf(`${folder.folderPath}/`);
      if (tmpIndex >= 0) label = label.slice(folder.folderPath.length + 1);
      label = breakAtDots(label);
      contents.push(
        <SidebarItem
          key={id}
          id={id}
          label={label}
          link={`/suite/${_escape(filePath)}`}
          icon="file-o"
          fSelected={false}
        />
      );
    });
    const linkBack = folder.parentFolderPath != null
      ? `/folder/${folder.parentFolderPath}`
      : null;
    return { contents, linkBack };
  }

  renderSuite() {
    const suite: SnapshotSuiteT = (this.props.fetchedItem: any);
    const fetchedItemPath: string = (this.props.fetchedItemPath: any);
    const { query } = this.props;
    const contents = [];
    const groups = {};
    Object.keys(suite).forEach((id) => {
      if (id === '__folderPath') return;
      const name = snapshotName(id);
      const snapshot = suite[id];
      if (groups[name]) {
        groups[name].snapshots.push(snapshot);
      } else {
        groups[name] = { snapshots: [snapshot] };
      }
    });
    Object.keys(groups).forEach((name) => {
      const { snapshots } = groups[name];
      if (snapshots.length === 1) {
        const { id } = snapshots[0];
        contents.push(
          <SidebarItem
            key={id}
            id={id}
            label={snapshotName(id)}
            link={`/suite/${_escape(fetchedItemPath)}?id=${_escape(id)}`}
            icon="camera"
            fSelected={query && query.id === id}
          />
        );
      } else {
        const items = snapshots.map(({ id }) =>
          <SidebarItem
            key={id}
            id={id}
            label={id.slice(name.length).trim()}
            link={`/suite/${_escape(fetchedItemPath)}?id=${_escape(id)}`}
            icon="camera"
            fSelected={query && query.id === id}
          />
        );
        contents.push(
          <SidebarGroup key={name} name={name}>
            {items}
          </SidebarGroup>
        );
      }
    });
    const linkBack = `/folder/${suite.__folderPath}`;
    return { contents, linkBack };
  }

  renderPreview() {
    const { query } = this.props;
    const { fetchedItemType, fetchedItemPath } = this.props;
    let snapshot;
    let key = 'preview';
    if (fetchedItemType === 'SUITE' && query && query.id != null && fetchedItemPath) {
      const suite: SnapshotSuiteT = (this.props.fetchedItem: any);
      snapshot = suite[query.id];
      key = `${fetchedItemPath}_${query.id}`;
    }
    return (
      <Preview
        key={key}
        snapshot={snapshot}
      />
    );
  }
}

// ------------------------------------------
const style = {
  outer: flexContainer('row', {
    minHeight: '100vh',
  }),
  titleBarIcon: {
    cursor: 'default',
  },
};

// ==========================================
// Public API
// ==========================================
export default AppContents;
