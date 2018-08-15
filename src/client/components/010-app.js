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
// Declarations
// ==========================================
type SidebarTypeT = 'FOLDER' | 'SUITE';
type Props = {
  /* eslint-disable react/no-unused-prop-types */
  match: Object,
  /* eslint-enable react/no-unused-prop-types */
  location: Object,
};
type State = {
  fetchedItemType: ?SidebarTypeT,
  fetchedItem: ?(FolderT | SnapshotSuiteT),
  fetchedItemPath: ?string,
  error: ?string,
  fRedirectToRoot: boolean,
};

// ==========================================
// Component
// ==========================================
class App extends React.Component<Props, State> {
  state = {
    fetchedItemType: null,
    fetchedItem: null,
    fetchedItemPath: null,
    error: null,
    fRedirectToRoot: false,
  };

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

  componentWillUpdate(nextProps: Props) {
    this.fetchSidebarData(this.props, nextProps);
  }

  fetchSidebarData(prevProps?: Props, nextProps: Props) {
    const { match } = nextProps;
    const { path, url, params } = match;
    if (prevProps != null && url === prevProps.match.url) return;
    if (path === '/') {
      this.fetchFolder('-');
    } else if (path === '/folder/*') {
      this.fetchFolder(params[0]);
    } else if (path === '/suite/*') {
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
        location={this.props.location}
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

  async fetchFolder(folderPath: ?string) {
    if (folderPath == null) return;
    try {
      const res = await fetch('/api/folder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ folderPath }),
      });
      const folder: FolderT = await res.json();
      this.setState({
        fetchedItemType: 'FOLDER',
        fetchedItem: folder,
        fetchedItemPath: folderPath,
      });
    } catch (err) {
      this.setState({ error: `Could not find ${folderPath}` });
    }
  }

  async fetchSuite(filePath: ?string) {
    if (filePath == null) return;
    try {
      const res = await fetch('/api/suite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      const suite: SnapshotSuiteT = await res.json();
      this.setState({
        fetchedItemType: 'SUITE',
        fetchedItem: suite,
        fetchedItemPath: filePath,
      });
    } catch (err) {
      this.setState({ error: `Could not find ${filePath}` });
    }
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
// Public
// ==========================================
export default App;
export { socketDisconnect };
