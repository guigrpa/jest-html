// @flow

/* eslint-env browser */
import React from 'react';
import {
  Floats, Hints, Notifications,
  Spinner, Icon,
  flexContainer,
  hoverable,
} from 'giu';
import type {
  FolderT,
  SnapshotSuiteT,
  SnapshotT,
} from '../../common/types';
import Sidebar from './110-sidebar';
import SidebarItem, { SidebarGroup } from './115-sidebarItem';
import Preview from './120-preview';
import LargeMessage from './200-largeMessage';

require('./010-app.sass');

const breakAtSlashes = (str) => str.replace(/\//g, '/\u200B');
const lastSegment = (path) => {
  if (!path) return '';
  const segments = path.split('/');
  return segments[segments.length - 1];
};
const snapshotName = (id) => {
  const segments = id.split(' ');
  return segments.slice(0, segments.length - 1).join(' ');
};

// ==========================================
// Component declarations
// ==========================================
type SidebarTypeT = 'folder' | 'suite';
type PropsT = {
  onHoverStart: Function,
  onHoverStop: Function,
  hovering: any,
};

// ==========================================
// Component
// ==========================================
class App extends React.Component {
  props: PropsT;
  state: {
    sidebarItemType: ?SidebarTypeT,
    sidebarItem: ?(FolderT | SnapshotSuiteT),
    sidebarItemPath: ?string,
    lastFolder: ?FolderT,
    snapshot: ?SnapshotT,
    error: ?string,
  };

  constructor(props: PropsT) {
    super(props);
    this.state = {
      sidebarItemType: null,
      sidebarItem: null,
      sidebarItemPath: null,
      lastFolder: null,
      snapshot: null,
      error: null,
    };
  }

  componentDidMount() {
    this.goToFolder('.');
  }

  // ------------------------------------------
  render() {
    if (this.state.error) {
      return (
        <LargeMessage>
          <b>An error occurred:</b><br />
          {this.state.error}
        </LargeMessage>
      );
    }
    if (!this.state.sidebarItem) return <Spinner />;
    return (
      <div style={style.outer}>
        <Floats />
        <Notifications />
        <Hints />
        {this.renderSidebar()}
        {this.renderPreview()}
      </div>
    );
  }

  renderPreview() {
    const key = this.state.snapshot
      ? `${this.state.sidebarItemPath}_${this.state.snapshot.id}`
      : 'preview';
    return (
      <Preview
        key={key}
        snapshot={this.state.snapshot}
      />
    );
  }

  renderSidebar() {
    const fFolder = this.state.sidebarItemType === 'folder';
    const { sidebarItemPath } = this.state;
    const { contents, onBack } = fFolder ? this.renderFolder() : this.renderSuite();
    let title;
    if (fFolder) {
      const folder: FolderT = (this.state.sidebarItem: any);
      title = folder.parentFolderPath != null
      ? <span>
          <Icon icon="folder-open-o" style={style.titleBarIcon} />&nbsp;
          {lastSegment(sidebarItemPath)}
        </span>
      : <span>
          <Icon icon="home" style={style.titleBarIcon} />&nbsp;Root
        </span>;
    } else {
      title = (
        <span>
          <Icon icon="file-o" style={style.titleBarIcon} />&nbsp;
          {lastSegment(sidebarItemPath).split('.')[0]}
        </span>
      );
    }
    return (
      <Sidebar title={title} subtitle={sidebarItemPath} onBack={onBack}>
        {contents}
      </Sidebar>
    );
  }

  renderFolder() {
    const folder: FolderT = (this.state.sidebarItem: any);
    const out = [];
    const fRoot = !folder.parentFolderPath;
    const onBack = fRoot ? undefined : () => this.goToFolder(folder.parentFolderPath);
    folder.childrenFolderPaths.forEach((folderPath) => {
      const id = `folder_${folderPath}`;
      out.push(
        <SidebarItem
          key={id}
          id={id}
          label={breakAtSlashes(folderPath)}
          icon="folder-o"
          onClick={() => this.goToFolder(folderPath)}
          fSelected={false}
        />
      );
    });
    folder.filePaths.forEach((filePath) => {
      const id = `suite_${filePath}`;
      out.push(
        <SidebarItem
          key={id}
          id={id}
          label={breakAtSlashes(filePath)}
          icon="file-o"
          onClick={() => this.goToSuite(filePath)}
          fSelected={false}
        />
      );
    });
    return { contents: out, onBack };
  }

  renderSuite() {
    const suite: SnapshotSuiteT = (this.state.sidebarItem: any);
    if (this.state.lastFolder == null) return { contents: null, onBack: null };
    const { folderPath } = this.state.lastFolder;
    const onBack = () => this.goToFolder(folderPath);
    const contents = [];
    const groups = {};
    Object.keys(suite).forEach((id) => {
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
            icon="camera"
            onClick={() => this.setState({ snapshot: suite[id] })}
            fSelected={!!this.state.snapshot && this.state.snapshot.id === id}
          />
        );
      } else {
        const items = snapshots.map(({ id }) =>
          <SidebarItem
            key={id}
            id={id}
            label={id.slice(name.length).trim()}
            icon="camera"
            onClick={() => this.setState({ snapshot: suite[id] })}
            fSelected={!!this.state.snapshot && this.state.snapshot.id === id}
          />
        );
        contents.push(
          <SidebarGroup key={name} name={name}>
            {items}
          </SidebarGroup>
        );
      }
    });
    return { contents, onBack };
  }

  // ------------------------------------------
  goToFolder(folderPath: string) {
    fetch('/api/folder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folderPath }),
    })
    .then((res) => res.json())
    .then((folder: FolderT) => {
      this.setState({
        sidebarItemType: 'folder',
        sidebarItem: folder,
        sidebarItemPath: folderPath,
        lastFolder: folder,
        snapshot: null,
      });
    });
  }

  goToSuite(filePath: string) {
    fetch('/api/suite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
    .then((res) => res.json())
    .then((suite: SnapshotSuiteT) => {
      this.setState({
        sidebarItemType: 'suite',
        sidebarItem: suite,
        sidebarItemPath: filePath,
        snapshot: null,
      });
    });
  }
}

// ------------------------------------------
const style = {
  outer: flexContainer('row', {
    height: '100vh',
  }),
  titleBarIcon: {
    cursor: 'default',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(App);
