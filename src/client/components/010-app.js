// @flow

/* eslint-env browser */
import React from 'react';
import {
  Floats,
  Spinner, Icon,
  flexContainer,
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
  pathname: string,
  pattern: string,
  params: any,
  location: Object,
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
    snapshot: ?SnapshotT,
    error: ?string,
  };

  constructor(props: PropsT) {
    super(props);
    this.state = {
      sidebarItemType: null,
      sidebarItem: null,
      sidebarItemPath: null,
      snapshot: null,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchSidebarData(undefined, this.props);
    this.fetchSnapshotData(undefined, this.props);
  }

  componentWillUpdate(nextProps: PropsT) {
    this.fetchSidebarData(this.props, nextProps);
    this.fetchSnapshotData(this.props, nextProps);
  }

  fetchSidebarData(prevProps?: PropsT, nextProps: PropsT) {
    const { pathname, pattern, params } = nextProps;
    if (prevProps != null && pathname === prevProps.pathname) return;
    if (pathname === '/') {
      this.goToFolder('-');
    } else if (pattern.indexOf('/folder') === 0) {
      this.goToFolder(params[0]);
    } else if (pattern.indexOf('/suite') === 0) {
      this.goToSuite(params[0]);
    }
  }

  fetchSnapshotData(prevProps?: PropsT, nextProps: PropsT) {
    const { location } = nextProps;
    if (prevProps != null && location.query === prevProps.location.query) return;
    if (!location.query || !this.state.sidebarItem) {
      this.setState({ snapshot: null });
      return;
    }
    this.setState({ snapshot: this.state.sidebarItem[location.query.id] });
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
        {this.renderSidebar()}
        {this.renderPreview()}
      </div>
    );
  }

  renderSidebar() {
    const fFolder = this.state.sidebarItemType === 'folder';
    const { sidebarItemPath } = this.state;
    const { contents, linkBack } = fFolder ? this.renderFolder() : this.renderSuite();
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
      <Sidebar title={title} subtitle={sidebarItemPath} linkBack={linkBack}>
        {contents}
      </Sidebar>
    );
  }

  renderFolder() {
    const folder: FolderT = (this.state.sidebarItem: any);
    const contents = [];
    folder.childrenFolderPaths.forEach((folderPath) => {
      const id = `folder_${folderPath}`;
      contents.push(
        <SidebarItem
          key={id}
          id={id}
          label={breakAtSlashes(folderPath)}
          link={`/folder/${folderPath}`}
          icon="folder-o"
          onClick={() => this.goToFolder(folderPath)}
          fSelected={false}
        />
      );
    });
    folder.filePaths.forEach((filePath) => {
      const id = `suite_${filePath}`;
      contents.push(
        <SidebarItem
          key={id}
          id={id}
          label={breakAtSlashes(filePath)}
          link={`/suite/${filePath}`}
          icon="file-o"
          onClick={() => this.goToSuite(filePath)}
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
    const suite: SnapshotSuiteT = (this.state.sidebarItem: any);
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
            link={`/suite/${this.state.sidebarItemPath}?id=${id}`}
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
            link={`/suite/${this.state.sidebarItemPath}?id=${id}`}
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
    const linkBack = `/folder/${suite.__folderPath}`;
    return { contents, linkBack };
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
        snapshot: null,
      });
    });
  }

  goToSuite(filePath: string) {
    const { query } = this.props.location;
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
        snapshot: query ? suite[query.id] : null,
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
export default App;
