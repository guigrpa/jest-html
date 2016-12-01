// @flow

import fs from 'fs';
import path from 'path';
import globby from 'globby';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';
import { clone, merge, addLast } from 'timm';
import { mainStory, chalk } from 'storyboard';
import type { StoryT } from 'storyboard';
import { HTML_PREVIEW_SEPARATOR } from '../serializer';
import type {
  FilePathT, FolderPathT,
  FolderT, SnapshotSuiteT, SnapshotT,
} from '../common/types';

type ConfigT = {|
  snapshotPatterns: Array<string>,
  cssPatterns: Array<string>,
  watch: boolean,
  socketioServer: Object,
|};

type SnapshotSuiteDictT = { [filePath: FilePathT]: SnapshotSuiteT };
type FolderDictT = { [folderPath: FolderPathT]: FolderT };

const FOLDER_PATH_ATTR = '__folderPath';
const DIRTY_ATTR = '__dirty';
const DELETED_ATTR = '__deleted';

let _config: ConfigT;
let _folderDict: FolderDictT = {};
let _watchers = null;

const configure = (newConfig: $Shape<ConfigT>) => {
  if (!_config) {
    _config = clone(newConfig);
    return;
  }
  _config = (merge(_config, newConfig): any);
};

const start = async ({ story = mainStory }: { story: StoryT } = {}) => {
  await loadCommonCss(story);
  await loadAllSnapshots(story);
  if (_config.watch) watchStart(story);
  broadcastSignal();
};

// ---------------------------------
// Snapshots
// ---------------------------------
let _snapshotSuiteDict: SnapshotSuiteDictT = {};

const loadAllSnapshots = async (story: StoryT = mainStory) => {
  const childStory = story.child({ src: 'extractor', title: 'Refresh snapshots' });
  try {
    const filePaths = await globby(_config.snapshotPatterns);
    childStory.info('extractor', 'Reading snapshot files...');
    const commonCss = getCommonCss();
    _snapshotSuiteDict = {};
    for (let i = 0; i < filePaths.length; i++) {
      await loadSuite(filePaths[i], commonCss, childStory);
    }
    buildFolderDict(childStory);
    childStory.debug('extractor', 'Snapshot tree:', { attach: _folderDict });
  } finally {
    childStory.close();
  }
};

const updateSnapshotCss = (story: StoryT = mainStory) => {
  const commonCss = getCommonCss();
  Object.keys(_snapshotSuiteDict).forEach((filePath) => {
    const suite = _snapshotSuiteDict[filePath];
    const suiteCss = getSuiteCss(filePath, story);
    const css = suiteCss != null ? addLast(commonCss, suiteCss) : commonCss;
    forEachSnapshot(suite, (snapshot) => { snapshot.css = css; }); // eslint-disable-line no-param-reassign, max-len
  });
};

const loadSuite = async (filePath: string, commonCss: Array<string>, story: StoryT) => {
  story.info('extractor', `Processing ${chalk.cyan.bold(filePath)}...`);
  const absPath = path.resolve(process.cwd(), filePath);
  const rawSnapshots = loadSnapshot(absPath);
  const suiteCss = getSuiteCss(filePath, story);
  const finalFilePath = `-/${filePath.normalize()}`;
  const prevSuite = _snapshotSuiteDict[finalFilePath];
  // $FlowFixMe
  const suite: SnapshotSuiteT = {};
  let suiteDirty = false;
  const nextIds = Object.keys(rawSnapshots);
  for (let i = 0; i < nextIds.length; i++) {
    const id = nextIds[i];
    const rawSnapshot = rawSnapshots[id];
    const [snap, html] = rawSnapshot.split(HTML_PREVIEW_SEPARATOR);
    const css = suiteCss != null ? addLast(commonCss, suiteCss) : commonCss;
    const snapshot: SnapshotT = { id, snap, html, css, dirty: false, deleted: false };
    if (prevSuite && prevSuite[id]) {
      const prevSnapshot = prevSuite[id];
      const prevBaseline = prevSnapshot.baseline;
      // Copy the previous baseline, if any
      if (prevBaseline != null) {
        snapshot.baseline = prevBaseline;
        snapshot.dirty = html !== prevBaseline.html || snap !== prevBaseline.snap;
      // Create a new baseline if the snapshot's SNAP or HTML have changed
      } else if (html !== prevSnapshot.html || snap !== prevSnapshot.snap) {
        snapshot.baseline = { html: prevSnapshot.html, snap: prevSnapshot.snap };
        snapshot.dirty = true;
      }
    }
    suite[id] = snapshot;
    suiteDirty = suiteDirty || snapshot.dirty;
  }
  if (prevSuite != null) {
    forEachSnapshot(prevSuite, (snapshot) => {
      const { id } = snapshot;
      if (nextIds.indexOf(id) < 0) {
        snapshot.deleted = true;   // eslint-disable-line no-param-reassign
        suite[id] = snapshot;
        suiteDirty = true;
      }
    });
  }
  story.debug('extractor', `Found ${Object.keys(rawSnapshots).length} snapshots`);
  suite[FOLDER_PATH_ATTR] = path.dirname(finalFilePath);
  suite[DIRTY_ATTR] = suiteDirty;
  suite[DELETED_ATTR] = false;
  _snapshotSuiteDict[finalFilePath] = sortSnapshots(suite);
};

const saveAsBaseline = (filePath: string, id: string) => {
  const suite = _snapshotSuiteDict[filePath.normalize()];
  if (suite == null) return;
  const snapshot = suite[id];
  if (snapshot == null || !snapshot.baseline) return;
  delete snapshot.baseline;
  snapshot.dirty = false;
  suite.__dirty = false;
  buildFolderDict(mainStory);
  broadcastSignal();
};

const loadSnapshot = (absPath: string): Object => {
  /* eslint-disable global-require, import/no-dynamic-require */
  delete require.cache[require.resolve(absPath)];
  return require(absPath);
  /* eslint-enable global-require */
};

const sortSnapshots = (suite): Object => {
  const out = {};
  Object.keys(suite).sort().forEach((id) => { out[id] = suite[id]; });
  return out;
};

// ---------------------------------
// CSS
// ---------------------------------
let _commonCss: Array<string> = [];

const getCommonCss = () => _commonCss;

const loadCommonCss = async (story: StoryT = mainStory): Promise<void> => {
  story.info('extractor', 'Extracting common CSS...');
  const cssPaths = await globby(_config.cssPatterns);
  _commonCss = cssPaths.map((cssPath) => {
    story.info('extractor', `Processing ${chalk.cyan.bold(cssPath)}...`);
    return fs.readFileSync(cssPath, 'utf8');
  });
};

const getSuiteCss = (filePath: string, story: StoryT): ?string => {
  let suiteCss;
  try {
    const cssPath = getCssPathForSuite(filePath);
    story.debug('extractor', `Trying to read ${chalk.cyan.bold(cssPath)}...`);
    suiteCss = fs.readFileSync(cssPath, 'utf8');
    story.info('extractor', `Found custom CSS in ${chalk.cyan.bold(cssPath)}`);
  } catch (err) { /* no file exists */ }
  return suiteCss;
};

const getCssPathForSuite = (filePath: FilePathT): string => {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, `${name}.css`);
};

// ---------------------------------
// Folder dictionary
// ---------------------------------
const buildFolderDict = (story: StoryT) => {
  story.info('extractor', 'Building folder tree...');
  const nextDict: FolderDictT = {};

  // Create root node
  let curFolderPath: FolderPathT = '-';
  let curFolder: FolderT = {
    parentFolderPath: null,
    folderPath: '-',
    dirty: false,

    filePaths: [],
    suiteDirtyFlags: [],

    childrenFolderPaths: [],
    childrenFolderDirtyFlags: [],
  };
  nextDict['-'] = curFolder;

  story.debug('extractor', 'Snapshot tree:', { attach: nextDict });

  // Sort file paths to simplify tree generation
  const filePaths: Array<FilePathT> = Object.keys(_snapshotSuiteDict).sort();

  // Process all file paths
  filePaths.forEach((filePath) => {
    story.debug('extractor', `File: ${filePath}`);
    const folderPath: FolderPathT = path.dirname(filePath);
    if (folderPath === curFolderPath) {
      curFolder.filePaths.push(filePath);
    } else {
      let parentFolderPath = folderPath;
      let fFound = false;
      while (!fFound) {
        if (parentFolderPath === '-') break;
        parentFolderPath = path.dirname(parentFolderPath);
        if (nextDict[parentFolderPath]) {
          fFound = true;
          break;
        }
      }
      if (!fFound) throw new Error('Error building path tree');
      nextDict[parentFolderPath].childrenFolderPaths.push(folderPath);
      curFolder = nextDict[folderPath] = {
        parentFolderPath,
        folderPath,
        dirty: false,

        filePaths: [filePath],
        suiteDirtyFlags: [],

        childrenFolderPaths: [],
        childrenFolderDirtyFlags: [],
      };
      curFolderPath = folderPath;
    }
  });

  // Update children dirty flags for each folder
  updateChildrenDirtyFlags(nextDict, _snapshotSuiteDict, '-');
  _folderDict = nextDict;
};

// Update dirty flags, recursively, top-down
const updateChildrenDirtyFlags = (
  folderDict: FolderDictT,
  suiteDict: SnapshotSuiteDictT,
  folderPath: FolderPathT
): boolean => {
  const curFolder = folderDict[folderPath];
  curFolder.suiteDirtyFlags = curFolder.filePaths.map((filePath) =>
    _snapshotSuiteDict[filePath][DIRTY_ATTR]);
  curFolder.childrenFolderDirtyFlags = curFolder.childrenFolderPaths.map((subFolderPath) =>
    updateChildrenDirtyFlags(folderDict, suiteDict, subFolderPath));
  curFolder.dirty = curFolder.suiteDirtyFlags.some(Boolean) ||
    curFolder.childrenFolderDirtyFlags.some(Boolean);
  return curFolder.dirty;
};

// ---------------------------------
// Watching and real-time
// ---------------------------------
const watchStart = (story: StoryT) => {
  if (_watchers) return;
  _watchers = {};
  // const glob = _config.snapshotPatterns.concat(_config.cssPatterns);
  const options = {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
  };
  _watchers.css = chokidar.watch(_config.cssPatterns, options);
  _watchers.snap = chokidar.watch(_config.snapshotPatterns, options);
  ['change', 'add', 'unlink'].forEach((type) => {
    // $FlowFixMe
    _watchers.css.on(type, (filePath) => { cssWatchEvent(type, filePath); });
    // $FlowFixMe
    _watchers.snap.on(type, (filePath) => { snapWatchEvent(type, filePath); });
  });
  story.info('extractor', 'Started watching over snapshot and CSS files');
};

// const watchStop = (story: StoryT) => {
//   if (_watchers == null) return;
//   _watchers.close();
//   _watchers = null;
//   story.info('extractor', 'Stopped file watcher');
// };

const cssWatchEvent = (type: string, filePath0: string) => {
  const filePath = slash(filePath0);
  mainStory.debug('extractor', 'CSS watch fired: ' +
    `${chalk.bold(type.toUpperCase())} ${chalk.cyan.bold(filePath)}`);
  debouncedCssRefresh();
};

const debouncedCssRefresh = debounce(() =>
  Promise.resolve()
  .then(() => loadCommonCss())
  .then(() => updateSnapshotCss())
  .then(() => broadcastSignal())
, 300);

const snapWatchEvent = (type: string, filePath0: string) => {
  const filePath = slash(filePath0);
  mainStory.debug('extractor', 'Snapshot watch fired: ' +
    `${chalk.bold(type.toUpperCase())} ${chalk.cyan.bold(filePath)}`);
  Promise.resolve()
  .then(() => {
    const commonCss = getCommonCss();
    switch (type) {
      case 'change':
      case 'add':
        return Promise.resolve()
        .then(() => loadSuite(filePath, commonCss, mainStory))
        .then(() => buildFolderDict(mainStory));
      case 'unlink':
        return Promise.resolve()
        .then(() => {
          const suite = _snapshotSuiteDict[`-/${filePath.normalize()}`];
          if (suite) {
            suite[DIRTY_ATTR] = true;
            suite[DELETED_ATTR] = true;
            return buildFolderDict(mainStory);
          }
          return null;
        });
      default:
        break;
    }
    return null;
  })
  .then(() => broadcastSignal());
};

const broadcastSignal = () => {
  if (!_config.socketioServer) return;
  _config.socketioServer.emit('REFRESH');
};

// ---------------------------------
// Others
// ---------------------------------
const getFolder = (folderPath: FolderPathT): ?FolderT =>
  _folderDict[folderPath.normalize()];
const getSnapshotSuite = (filePath: FilePathT): ?SnapshotSuiteT =>
  _snapshotSuiteDict[filePath.normalize()];

const forEachSnapshot = (suite: SnapshotSuiteT, cb: (snapshot: SnapshotT) => any) => {
  Object.keys(suite).forEach((id) => {
    if (id === FOLDER_PATH_ATTR || id === DIRTY_ATTR || id === DELETED_ATTR) return;
    cb(suite[id]);
  });
};

const slash = (str) => str.replace(/\\/g, '/');

// =============================================
// Public API
// =============================================
export {
  configure,
  start,
  getFolder,
  getSnapshotSuite,
  saveAsBaseline,
};
