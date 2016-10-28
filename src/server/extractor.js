// @flow

import path from 'path';
import globby from 'globby';
import { clone, merge } from 'timm';
import { mainStory, chalk } from 'storyboard';
import type { StoryT } from 'storyboard';
import { HTML_PREVIEW_SEPARATOR } from '../serializer';
import type {
  SnapshotT,
  FilePathT,
  FolderPathT,
  FolderT,
  SnapshotSuiteT,
} from '../common/types';

type ConfigT = {
  filePatterns: Array<string>,
};

type SnapshotSuiteDictT = { [filePath: FilePathT]: SnapshotSuiteT };
type FolderDictT = { [folderPath: FolderPathT]: FolderT };

let config: ConfigT;
let snapshotSuiteDict: SnapshotSuiteDictT = {};
let folderDict: FolderDictT = {};

const configure = (newConfig: $Shape<ConfigT>) => {
  if (!config) {
    config = clone(newConfig);
    return;
  }
  config = merge(config, newConfig);
};

const refresh = ({ story = mainStory }: { story: StoryT } = {}) => {
  const childStory = story.child({ src: 'extractor', title: 'Refresh snapshots' });
  return Promise.resolve()
  .then(() => globby(config.filePatterns))
  .then((filePaths) => {
    childStory.info('extractor', 'Reading snapshot files...');
    const extractedSnapshots: SnapshotSuiteDictT = {};
    filePaths.forEach((filePath) => {
      extractedSnapshots[`./${filePath}`] = extractSnapshots(filePath, childStory);
    });
    snapshotSuiteDict = extractedSnapshots;
    childStory.info('extractor', 'Building tree...');
    folderDict = buildFolderDict(snapshotSuiteDict, childStory);
    childStory.debug('extractor', 'Snapshot tree:', { attach: folderDict });
    childStory.close();
  })
  .catch((err) => {
    childStory.close();
    throw err;
  });
};

const extractSnapshots = (filePath: string, story: StoryT): SnapshotSuiteT => {
  story.info('extractor', `Processing ${chalk.cyan.bold(filePath)}...`);
  const absPath = path.resolve(process.cwd(), filePath);
  /* eslint-disable global-require, import/no-dynamic-require */
  // $FlowFixMe
  const rawSnapshots = require(absPath);
  /* eslint-enable global-require */
  const out: SnapshotSuiteT = {};
  Object.keys(rawSnapshots).forEach((id) => {
    const snapshot = rawSnapshots[id];
    const [snap, html] = snapshot.split(HTML_PREVIEW_SEPARATOR);
    out[id] = { id, snap, html };
  });
  story.debug('extractor', `Found ${Object.keys(rawSnapshots).length} snapshots`);
  return out;
};

const buildFolderDict = (snapshotSuite: SnapshotSuiteDictT, story: StoryT): FolderDictT => {
  story.debug('extractor', 'Building folder tree...');
  const out: FolderDictT = {};

  // Sort file paths to simplify tree generation
  const filePaths: Array<FilePathT> = Object.keys(snapshotSuite).sort();

  // Create root node
  let curFolderPath: FolderPathT = '.';
  let curFolder: FolderT = {
    folderPath: '.',
    filePaths: [],
    parentFolderPath: null,
    childrenFolderPaths: [],
  };
  out['.'] = curFolder;

  story.debug('extractor', 'Snapshot tree:', { attach: out });

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
        if (parentFolderPath === '.') break;
        parentFolderPath = path.dirname(parentFolderPath);
        if (out[parentFolderPath]) {
          fFound = true;
          break;
        }
      }
      if (!fFound) throw new Error('Error building path tree');
      out[parentFolderPath].childrenFolderPaths.push(folderPath);
      curFolder = out[folderPath] = {
        folderPath,
        filePaths: [filePath],
        parentFolderPath,
        childrenFolderPaths: [],
      };
      curFolderPath = folderPath;
    }
  });
  return out;
};

const getFolder = (folderPath: FolderPathT): ?FolderT => folderDict[folderPath];
const getSnapshotSuite = (filePath: FilePathT): ?SnapshotSuiteT => snapshotSuiteDict[filePath];

// =============================================
// Public API
// =============================================
export {
  configure,
  refresh,
  getFolder,
  getSnapshotSuite,
};
