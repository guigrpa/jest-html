// @flow

/* eslint-env browser */
import React from 'react';
import { Redirect } from 'react-router'; // eslint-disable-line
import {
  Floats,
  Hints,
  Spinner,
  Icon,
  Button,
  flexContainer,
  hintDefine,
  hintShow,
} from 'giu';
import type { FolderT, SnapshotSuiteT } from '../../common/types';
import { UI } from '../gral/constants';
import { waitUntil } from '../gral/helpers';
import Sidebar from './110-sidebar';
import SidebarItem, { SidebarGroup } from './115-sidebarItem';
import Preview from './120-preview';
import LargeMessage from './200-largeMessage';

require('./010-app.sass');

// const breakAtSlashes = (str) => str.replace(/\//g, '/\u200B');
const breakAtDots = str => str.replace(/\./g, '.\u200B');
const lastSegment = path => {
  if (!path) return '';
  const segments = path.split('/');
  return segments[segments.length - 1];
};
const snapshotName = id => {
  const segments = id.split(' ');
  return segments.slice(0, segments.length - 1).join(' ');
};

// ==========================================
// Declarations
// ==========================================
type SidebarTypeT = 'FOLDER' | 'SUITE';
type Props = {
  fetchedItemType: ?SidebarTypeT,
  fetchedItem: ?(FolderT | SnapshotSuiteT),
  fetchedItemPath: ?string,
  error: ?string,
  onRedirectToRoot: () => void,
  fRedirectToRoot?: boolean,
  location: Object,
  saveAsBaseline: (snapshotId: string) => any,
};
type State = {
  fRaw: boolean,
  fShowBaseline: boolean,
};

// ==========================================
// Component
// ==========================================
class AppContents extends React.PureComponent<Props, State> {
  state = {
    fRaw: false,
    fShowBaseline: false,
  };

  componentDidMount() {
    this.hintIfNeeded();
  }

  // ------------------------------------------
  render() {
    if (this.props.fRedirectToRoot) return <Redirect to="/" />;
    if (this.props.error) {
      return (
        <LargeMessage>
          <Icon icon="warning" disabled /> <b>An error occurred:</b>
          <br />
          {this.props.error}
          <br />
          <Button onClick={this.props.onRedirectToRoot}>
            <Icon icon="home" disabled /> Home
          </Button>
        </LargeMessage>
      );
    }
    if (!this.props.fetchedItem) {
      return (
        <LargeMessage>
          <Spinner />
          &nbsp;Loading…
        </LargeMessage>
      );
    }
    return (
      <div style={style.outer}>
        <Floats />
        <Hints />
        {this.renderSidebar()}
        {this.renderPreview()}
        {this.state.fShowBaseline && this.renderBaselineWarning()}
      </div>
    );
  }

  renderSidebar() {
    const fFolder = this.props.fetchedItemType === 'FOLDER';
    const { fetchedItemPath } = this.props;
    const { contents, linkBack } = fFolder
      ? this.renderFolder()
      : this.renderSuite();
    let title;
    if (fFolder) {
      const folder: FolderT = (this.props.fetchedItem: any);
      title =
        folder.parentFolderPath != null ? (
          <span>
            <Icon icon="folder-open-o" style={style.titleBarIcon} />
            &nbsp;
            {lastSegment(fetchedItemPath)}
          </span>
        ) : (
          <span>
            <Icon icon="home" style={style.titleBarIcon} />
            &nbsp;Root
          </span>
        );
    } else {
      title = (
        <span>
          <Icon icon="file-o" style={style.titleBarIcon} />
          &nbsp;
          {lastSegment(fetchedItemPath).split('.')[0]}
        </span>
      );
    }
    return (
      <Sidebar
        title={title}
        subtitle={fetchedItemPath}
        linkBack={linkBack}
        fRaw={this.state.fRaw}
        toggleRaw={this.toggleRaw}
      >
        {contents}
      </Sidebar>
    );
  }

  renderFolder() {
    const folder: FolderT = (this.props.fetchedItem: any);
    const contents = [];
    folder.childrenFolderPaths.forEach((folderPath, idx) => {
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
          dirty={folder.childrenFolderDirtyFlags[idx]}
          link={`/folder/${folderPath}`}
          icon="folder-o"
          fSelected={false}
        />
      );
    });
    folder.filePaths.forEach((filePath, idx) => {
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
          dirty={folder.suiteDirtyFlags[idx]}
          link={`/suite/${filePath}`}
          icon="file-o"
          fSelected={false}
        />
      );
    });
    const linkBack =
      folder.parentFolderPath != null
        ? `/folder/${folder.parentFolderPath}`
        : null;
    return { contents, linkBack };
  }

  renderSuite() {
    const suite: SnapshotSuiteT = (this.props.fetchedItem: any);
    const { location } = this.props;
    const contents = [];
    const groups = {};
    Object.keys(suite).forEach(id => {
      if (id === '__folderPath' || id === '__dirty' || id === '__deleted')
        return;
      const name = snapshotName(id);
      const snapshot = suite[id];
      if (groups[name]) {
        groups[name].snapshots.push(snapshot);
      } else {
        groups[name] = { snapshots: [snapshot] };
      }
    });
    Object.keys(groups).forEach(name => {
      const { snapshots } = groups[name];
      if (snapshots.length === 1) {
        const snapshot = snapshots[0];
        const { id, dirty, deleted } = snapshot;
        contents.push(
          this.renderSnapshotSidebarItem(
            id,
            snapshotName(id),
            dirty,
            deleted,
            location
          )
        );
      } else {
        const items = snapshots.map(({ id, dirty, deleted }) => {
          const label = id.slice(name.length).trim();
          return this.renderSnapshotSidebarItem(
            id,
            label,
            dirty,
            deleted,
            location
          );
        });
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

  renderSnapshotSidebarItem(
    id: string,
    label: string,
    dirty: boolean,
    deleted: boolean,
    location: ?Object
  ) {
    const fetchedItemPath: any = this.props.fetchedItemPath;

    return (
      <SidebarItem
        key={id}
        id={id}
        label={label}
        dirty={dirty}
        deleted={deleted}
        link={{ pathname: `/suite/${fetchedItemPath}`, state: { id } }}
        icon="camera"
        fSelected={!!location && location.state && location.state.id === id}
        showBaseline={this.showBaseline}
        hideBaseline={this.hideBaseline}
        saveAsBaseline={this.props.saveAsBaseline}
      />
    );
  }

  renderPreview() {
    const { location } = this.props;
    const { fetchedItemType, fetchedItemPath } = this.props;
    let snapshot;
    let key = 'preview';
    if (
      fetchedItemType === 'SUITE' &&
      location &&
      location.state &&
      location.state.id != null &&
      fetchedItemPath
    ) {
      const suite: SnapshotSuiteT = (this.props.fetchedItem: any);
      snapshot = suite[location.state.id];
      key = `${fetchedItemPath}_${location.state.id}`;
    }
    return (
      <Preview
        key={key}
        snapshot={snapshot}
        fRaw={this.state.fRaw}
        fShowBaseline={this.state.fShowBaseline}
      />
    );
  }

  renderBaselineWarning() {
    return (
      <div className="pulsate" style={style.baselineWarning}>
        <Icon icon="undo" />
      </div>
    );
  }

  // ------------------------------------------
  toggleRaw = () => {
    const { fRaw } = this.state;
    this.setState({ fRaw: !fRaw });
  };
  showBaseline = () => {
    this.setState({ fShowBaseline: true });
  };
  hideBaseline = () => {
    this.setState({ fShowBaseline: false });
  };

  // ------------------------------------------
  hintIfNeeded = async () => {
    try {
      await waitUntil(
        () => !!document.getElementById('jh-sidebar'),
        2000,
        'hintMain'
      );
    } catch (err) {
      return;
    }
    const elements = () => {
      const out = [];
      let node;
      node = document.getElementById('jh-sidebar');
      if (node) {
        const bcr = node.getBoundingClientRect();
        const x = bcr.width / 2;
        const y = window.innerHeight / 2;
        out.push({
          type: 'LABEL',
          x,
          y,
          align: 'center',
          children: 'Navigate through folders, suites and snapshots',
        });
        out.push({
          type: 'ARROW',
          from: { x, y },
          to: { x, y: y - 40 },
          counterclockwise: true,
        });

        const x2 = bcr.width + (window.innerWidth - bcr.width) / 2;
        out.push({
          type: 'LABEL',
          x: x2,
          y,
          align: 'center',
          children: 'Previews will appear here',
        });
        out.push({
          type: 'ARROW',
          from: { x: x2, y },
          to: { x: x2, y: y - 40 },
          counterclockwise: true,
        });
      }
      node = document.getElementById('jh-toggle-raw');
      if (node) {
        const bcr = node.getBoundingClientRect();
        const x = bcr.right + 60;
        const y = bcr.top + bcr.height / 2;
        out.push({
          type: 'LABEL',
          x,
          y,
          align: 'left',
          children: 'Toggle between raw snapshot and HTML preview',
        });
        out.push({
          type: 'ARROW',
          from: { x, y },
          to: { x: bcr.right + 6, y },
        });
      }
      return out;
    };
    hintDefine('main', { elements, closeLabel: 'Enjoy testing!' });
    hintShow('main');
  };
}

// ------------------------------------------
const style = {
  outer: flexContainer('row', {
    minHeight: '100vh',
  }),
  titleBarIcon: {
    cursor: 'default',
  },
  baselineWarning: {
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    fontSize: 32,
    position: 'fixed',
    color: UI.color.accentBg,
    top: 10,
    right: 20,
  },
};

// ==========================================
// Public
// ==========================================
export default AppContents;
