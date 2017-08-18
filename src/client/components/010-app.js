// @flow

/* eslint-env browser */
import React from 'react';
import socketio from 'socket.io-client';
import type { FolderT, SnapshotSuiteT } from '../../common/types';
import AppContents from './015-appContents';

const socket = socketio.connect();
const socketDisconnect = () => {
  socket.close();
};

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
  }

  // unit testing
  _setState(state: Object) {
    this.setState(state);
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
    return (
      <AppContents
        fetchedItemType={this.state.fetchedItemType}
        fetchedItem={this.state.fetchedItem}
        fetchedItemPath={this.state.fetchedItemPath}
        error={this.state.error}
        onRedirectToRoot={() => {
          this.setState({ fRedirectToRoot: true });
        }}
        fRedirectToRoot={this.state.fRedirectToRoot}
        query={this.props.location.query}
        saveAsBaseline={this.saveAsBaseline}
      />
    );
  }

  // ------------------------------------------
  refetch = () => {
    if (!this.state.fetchedItem) return;
    if (this.state.fetchedItemType === 'FOLDER') {
      this.fetchFolder(this.state.fetchedItemPath);
    } else {
      this.fetchSuite(this.state.fetchedItemPath);
    }
  };

  fetchFolder(folderPath: ?string) {
    if (folderPath == null) return;
    fetch('/api/folder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folderPath }),
    })
      .then(res => res.json())
      .then((folder: FolderT) => {
        this.setState({
          fetchedItemType: 'FOLDER',
          fetchedItem: folder,
          fetchedItemPath: folderPath,
        });
      })
      .catch(() => {
        // $FlowFixMe
        this.setState({ error: `Could not find ${folderPath}` });
      });
  }

  fetchSuite(filePath: ?string) {
    if (filePath == null) return;
    fetch('/api/suite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
      .then(res => res.json())
      .then((suite: SnapshotSuiteT) => {
        this.setState({
          fetchedItemType: 'SUITE',
          fetchedItem: suite,
          fetchedItemPath: filePath,
        });
      })
      .catch(() => {
        // $FlowFixMe
        this.setState({ error: `Could not find ${filePath}` });
      });
  }

  saveAsBaseline = (snapshotId: string) => {
    fetch('/api/saveAsBaseline', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        filePath: this.state.fetchedItemPath,
        id: snapshotId,
      }),
    });
  };
}

// ==========================================
// Public API
// ==========================================
export default App;
export { socketDisconnect };
