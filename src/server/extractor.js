// @flow

import fs from 'fs';
import path from 'path';
import globby from 'globby';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';
import { clone, merge, addLast } from 'timm';
import { mainStory, chalk } from 'storyboard';
import type { StoryT } from 'storyboard';
import slash from 'slash';
import { HTML_PREVIEW_SEPARATOR } from '../serializer';
import type {
  FilePathT,
  FolderPathT,
  FolderT,
  SnapshotSuiteT,
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

const start = ({ story = mainStory }: { story: StoryT } = {}) =>
  Promise.resolve()
  .then(() => loadCommonCss(story))
  .then(() => loadAllSnapshots(story))
  .then(() => { if (_config.watch) watchStart(story); })
  .then(() => broadcastSignal());

// ---------------------------------
// CSS
// ---------------------------------
let _snapshotSuiteDict: SnapshotSuiteDictT = {};

const loadAllSnapshots = (story: StoryT = mainStory) => {
  const childStory = story.child({ src: 'extractor', title: 'Refresh snapshots' });
  return Promise.resolve()
  .then(() => globby(_config.snapshotPatterns))
  .then((filePaths) => {
    childStory.info('extractor', 'Reading snapshot files...');
    const commonCss = getCommonCss();
    _snapshotSuiteDict = {};
    filePaths.forEach((filePath) => {
      loadSuite(filePath, commonCss, childStory);
    });
    buildFolderDict(childStory);
    childStory.debug('extractor', 'Snapshot tree:', { attach: _folderDict });
    childStory.close();
  })
  .catch((err) => {
    childStory.close();
    throw err;
  });
};

const updateSnapshotCss = (story: StoryT = mainStory) => {
  const commonCss = getCommonCss();
  Object.keys(_snapshotSuiteDict).forEach((filePath) => {
    const suite = _snapshotSuiteDict[filePath];
    const suiteCss = getSuiteCss(filePath, story);
    Object.keys(suite).forEach((id) => {
      if (id === FOLDER_PATH_ATTR) return;
      const snapshot = suite[id];
      const css = suiteCss != null ? addLast(commonCss, suiteCss) : commonCss;
      snapshot.css = css;
    });
  });
};

const loadSuite = (filePath: string, commonCss: Array<string>, story: StoryT) => {
  story.info('extractor', `Processing ${chalk.cyan.bold(filePath)}...`);
  const absPath = path.resolve(process.cwd(), filePath);
  const rawSnapshots = loadSnapshot(absPath);
  const suiteCss = getSuiteCss(filePath, story);
  const suite: SnapshotSuiteT = {};
  Object.keys(rawSnapshots).forEach((id) => {
    const snapshot = rawSnapshots[id];
    const [snap, html] = snapshot.split(HTML_PREVIEW_SEPARATOR);
    const css = suiteCss != null ? addLast(commonCss, suiteCss) : commonCss;
    suite[id] = { id, snap, html, css };
  });
  story.debug('extractor', `Found ${Object.keys(rawSnapshots).length} snapshots`);
  const finalFilePath = `-/${filePath}`;
  suite[FOLDER_PATH_ATTR] = path.dirname(finalFilePath);
  _snapshotSuiteDict[finalFilePath] = suite;
};

const loadSnapshot = (absPath: string): Object => {
  /* eslint-disable global-require, import/no-dynamic-require */
  delete require.cache[require.resolve(absPath)];
  return require(absPath);
  /* eslint-enable global-require */
};

// ---------------------------------
// CSS
// ---------------------------------
let _commonCss: Array<string> = [];

const getCommonCss = () => _commonCss;

const loadCommonCss = (story: StoryT = mainStory): Promise<void> => {
  story.info('extractor', 'Extracting common CSS...');
  return Promise.resolve()
  .then(() => globby(_config.cssPatterns))
  .then((cssPaths) => {
    _commonCss = cssPaths.map((cssPath) => {
      story.info('extractor', `Processing ${chalk.cyan.bold(cssPath)}...`);
      return fs.readFileSync(cssPath, 'utf8');
    });
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

  // Sort file paths to simplify tree generation
  const filePaths: Array<FilePathT> = Object.keys(_snapshotSuiteDict).sort();

  // Create root node
  let curFolderPath: FolderPathT = '-';
  let curFolder: FolderT = {
    folderPath: '-',
    filePaths: [],
    parentFolderPath: null,
    childrenFolderPaths: [],
  };
  nextDict['-'] = curFolder;

  story.debug('extractor', 'Snapshot tree:', { attach: nextDict });

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
        folderPath,
        filePaths: [filePath],
        parentFolderPath,
        childrenFolderPaths: [],
      };
      curFolderPath = folderPath;
    }
  });
  _folderDict = nextDict;
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
        return loadSuite(filePath, commonCss, mainStory);
      case 'add':
        return Promise.resolve()
        .then(() => loadSuite(filePath, commonCss, mainStory))
        .then(() => buildFolderDict(mainStory));
      case 'unlink':
        return Promise.resolve()
        .then(() => { delete _snapshotSuiteDict[`-/${filePath}`]; })
        .then(() => buildFolderDict(mainStory));
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
const getFolder = (folderPath: FolderPathT): ?FolderT => _folderDict[folderPath];
const getSnapshotSuite = (filePath: FilePathT): ?SnapshotSuiteT => _snapshotSuiteDict[filePath];

// =============================================
// Public API
// =============================================
export {
  configure,
  start,
  getFolder,
  getSnapshotSuite,
};
