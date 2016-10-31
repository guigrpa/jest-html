// @flow

/* eslint-env browser */
import React from 'react';
import { Redirect } from 'react-router';
import socketio from 'socket.io-client';
import {
  Floats,
  Spinner, Icon, Button,
  flexContainer,
  bindAll,
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

/* eslint-disable no-unused-vars */
const breakAtSlashes = (str) => str.replace(/\//g, '/\u200B');
const breakAtDots = (str) => str.replace(/\./g, '.\u200B');
/* eslint-enable no-unused-vars */
const lastSegment = (path) => {
  if (!path) return '';
  const segments = path.split('/');
  return segments[segments.length - 1];
};
const snapshotName = (id) => {
  const segments = id.split(' ');
  return segments.slice(0, segments.length - 1).join(' ');
};

const socket = socketio.connect();


// ==========================================
// Component declarations
// ==========================================
type SidebarTypeT = 'FOLDER' | 'SUITE';
type PropsT = {
  /* eslint-disable react/no-unused-prop-types */
  pathname: string,
  pattern: string,
  params: any,
  /* eslint-enable react/no-unused-prop-types */
  location: Object,
};

// ==========================================
// Component
// ==========================================
class App extends React.Component {
  props: PropsT;
  state: {
    // sidebar item: currently fetched item
    fetchedItemType: ?SidebarTypeT,
    fetchedItem: ?(FolderT | SnapshotSuiteT),
    fetchedItemPath: ?string,
    error: ?string,
    fRedirectToRoot: boolean,
  };
  socket: Object;

  constructor(props: PropsT) {
    super(props);
    this.state = {
      fetchedItemType: null,
      fetchedItem: null,
      fetchedItemPath: null,
      error: null,
      fRedirectToRoot: false,
    };
    bindAll(this, ['refetch']);
  }

  componentDidMount() {
    this.fetchSidebarData(undefined, this.props);
    socket.on('REFRESH', this.refetch);
  }

  componentWillUnmount() {
    socket.off('REFRESH', this.refetch);
  }

  componentWillUpdate(nextProps: PropsT) {
    this.fetchSidebarData(this.props, nextProps);
  }

  fetchSidebarData(prevProps?: PropsT, nextProps: PropsT) {
    const { pathname, pattern, params } = nextProps;
    if (prevProps != null && pathname === prevProps.pathname) return;
    if (pathname === '/') {
      this.fetchFolder('-');
    } else if (pattern.indexOf('/folder') === 0) {
      this.fetchFolder(params[0]);
    } else if (pattern.indexOf('/suite') === 0) {
      this.fetchSuite(params[0]);
    }
  }

  // ------------------------------------------
  render() {
    if (this.state.fRedirectToRoot) {
      return <Redirect to="/" />;
    }
    if (this.state.error) {
      return (
        <LargeMessage>
          <Icon icon="warning" disabled />{' '}<b>An error occurred:</b><br />
          {this.state.error}<br />
          <Button
            onClick={() => this.setState({ fRedirectToRoot: true })}
          >
            <Icon icon="home" disabled />{' '}Home
          </Button>
        </LargeMessage>
      );
    }
    if (!this.state.fetchedItem) {
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
    const fFolder = this.state.fetchedItemType === 'FOLDER';
    const { fetchedItemPath } = this.state;
    const { contents, linkBack } = fFolder ? this.renderFolder() : this.renderSuite();
    let title;
    if (fFolder) {
      const folder: FolderT = (this.state.fetchedItem: any);
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
    const folder: FolderT = (this.state.fetchedItem: any);
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
          link={`/folder/${folderPath}`}
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
          link={`/suite/${filePath}`}
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
    const suite: SnapshotSuiteT = (this.state.fetchedItem: any);
    const fetchedItemPath: string = (this.state.fetchedItemPath: any);
    const { query } = this.props.location;
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
            link={`/suite/${fetchedItemPath}?id=${id}`}
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
            link={`/suite/${fetchedItemPath}?id=${id}`}
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
    const { query } = this.props.location;
    const { fetchedItemType, fetchedItemPath } = this.state;
    let snapshot;
    let key = 'preview';
    if (fetchedItemType === 'SUITE' && query && query.id != null && fetchedItemPath) {
      const suite: SnapshotSuiteT = (this.state.fetchedItem: any);
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

  // ------------------------------------------
  refetch() {
    if (!this.state.fetchedItem) return;
    if (this.state.fetchedItemType === 'FOLDER') {
      this.fetchFolder(this.state.fetchedItemPath);
    } else {
      this.fetchSuite(this.state.fetchedItemPath);
    }
  }

  fetchFolder(folderPath: string) {
    fetch('/api/folder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folderPath }),
    })
    .then((res) => res.json())
    .then((folder: FolderT) => {
      this.setState({
        fetchedItemType: 'FOLDER',
        fetchedItem: folder,
        fetchedItemPath: folderPath,
      });
    })
    .catch(() => {
      this.setState({
        error: `Could not find ${folderPath}`,
      });
    });
  }

  fetchSuite(filePath: string) {
    fetch('/api/suite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
    .then((res) => res.json())
    .then((suite: SnapshotSuiteT) => {
      this.setState({
        fetchedItemType: 'SUITE',
        fetchedItem: suite,
        fetchedItemPath: filePath,
      });
    })
    .catch(() => {
      this.setState({
        error: `Could not find ${filePath}`,
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
