// @flow

/* eslint-env browser */
import React from 'react';
import {
  Floats, Hints, Notifications,
  Spinner, LargeMessage, Icon,
  flexContainer, flexItem,
  hoverable,
} from 'giu';
import type {
  FolderT,
  SnapshotSuiteT,
  SnapshotT,
} from '../../common/types';

require('./010-app.sass');

const breakAtSlashes = (str) => str.replace(/\//g, '/\u200B');

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
    lastFolder: ?FolderT,
    snapshot: ?SnapshotT,
    error: ?string,
  };

  constructor(props: PropsT) {
    super(props);
    this.state = {
      sidebarItemType: null,
      sidebarItem: null,
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

  renderSidebar() {
    let contents;
    if (this.state.sidebarItemType === 'folder') {
      contents = this.renderFolder();
    } else {
      contents = this.renderSuite();
    }
    return <div style={style.sidebar}>{contents}</div>;
  }

  renderFolder() {
    const folder: FolderT = (this.state.sidebarItem: any);
    const out = [];
    if (folder.parentFolderPath) {
      out.push(
        <Icon
          key={`folder_${folder.parentFolderPath}`}
          icon="chevron-left"
          onClick={() => this.goToFolder(folder.parentFolderPath)}
          style={style.back}
        />
      );
    }
    folder.childrenFolderPaths.forEach((folderPath) => {
      const id = `folder_${folderPath}`;
      const fHovered = this.props.hovering === id;
      out.push(
        <div
          key={id}
          id={id}
          onClick={() => this.goToFolder(folderPath)}
          style={style.key({ fHovered })}
          onMouseEnter={this.props.onHoverStart}
          onMouseLeave={this.props.onHoverStop}
        >
          <Icon icon="folder-o" />&nbsp;
          {breakAtSlashes(folderPath)}
        </div>
      );
    });
    folder.filePaths.forEach((filePath) => {
      const id = `suite_${filePath}`;
      const fHovered = this.props.hovering === id;
      out.push(
        <div
          key={id}
          id={id}
          onClick={() => this.goToSuite(filePath)}
          style={style.key({ fHovered })}
          onMouseEnter={this.props.onHoverStart}
          onMouseLeave={this.props.onHoverStop}
        >
          <Icon icon="file-o" />&nbsp;
          {breakAtSlashes(filePath)}
        </div>
      );
    });
    return out;
  }

  renderSuite() {
    const suite: SnapshotSuiteT = (this.state.sidebarItem: any);
    const out = [];
    if (this.state.lastFolder != null) {
      const { folderPath } = this.state.lastFolder;
      out.push(
        <Icon
          key="__BACK__"
          icon="chevron-left"
          onClick={() => this.goToFolder(folderPath)}
          style={style.back}
        />
      );
    }
    Object.keys(suite).forEach((id) => {
      const fSelected = !!this.state.snapshot && this.state.snapshot.id === id;
      const fHovered = this.props.hovering === id;
      out.push(
        <div
          key={id}
          id={id}
          onClick={() => this.setState({ snapshot: suite[id] })}
          style={style.key({ fSelected, fHovered })}
          onMouseEnter={this.props.onHoverStart}
          onMouseLeave={this.props.onHoverStop}
        >
          <Icon icon="camera" />&nbsp;
          {id}
        </div>
      );
    });
    return out;
  }

  renderPreview() {
    const { snapshot } = this.state;
    if (!snapshot) {
      return (
        <div style={style.preview}>
          <LargeMessage>No snapshot selected</LargeMessage>
        </div>
      );
    }
    if (!snapshot.html) {
      return (
        <div style={style.preview}>
          <pre style={style.previewNonHtml}>{snapshot.snap}</pre>
        </div>
      );
    }
    const contents = { __html: snapshot.html };
    /* eslint-disable react/no-danger */
    return <div style={style.preview} dangerouslySetInnerHTML={contents} />;
    /* eslint-enable react/no-danger */
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
  sidebar: flexItem('0 0 18em', {
    padding: '0.3em 0',
    backgroundColor: '#eee',
    fontFamily: 'sans-serif',
    fontSize: '0.8em',
    overflow: 'auto',
  }),
  preview: flexItem(1, {
    transform: 'translateZ(0)',  // isolate it!
  }),
  previewNonHtml: {
    padding: 10,
  },
  key: ({ fSelected, fHovered }: {
    fSelected?: boolean,
    fHovered?: boolean,
  }) => {
    let backgroundColor;
    if (fSelected && fHovered) {
      backgroundColor = '#ba360a';
    } else if (fHovered) {
      backgroundColor = '#ddd';
    } else if (fSelected) {
      backgroundColor = '#ca461a';
    }
    return {
      padding: '0.3em 1em',
      cursor: 'pointer',
      color: fSelected ? 'white' : undefined,
      backgroundColor,
      wordBreak: 'break-word',
    };
  },
  back: {
    padding: '0.3em',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(App);
