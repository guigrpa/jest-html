import { merge } from 'timm';

export const FOLDER_BASE = {
  folderPath: '-/path/to/folder',
  filePaths: [],
  suiteDirtyFlags: [],
  parentFolderPath: '-/path/to',
  childrenFolderPaths: [],
  childrenFolderDirtyFlags: [],
};

export const FOLDER_WITH_SUBFOLDERS_AND_SUITES = merge(FOLDER_BASE, {
  filePaths: [
    '-/path/to/folder/suite1.snap',
    '-/path/to/folder/suite2.snap',
    '-/path/to/folder/suite3.snap',
  ],
  suiteDirtyFlags: [
    false,
    false,
    false,
  ],
  childrenFolderPaths: [
    '-/path/to/folder/super/nested/folder',
    '-/path/to/folder/subdir',
  ],
  childrenFolderDirtyFlags: [
    false,
    false,
  ],
});

export const FOLDER_WITH_SUBFOLDERS = merge(FOLDER_BASE, {
  childrenFolderPaths: [
    '-/path/to/folder/super/nested/folder',
    '-/path/to/folder/subdir',
  ],
  childrenFolderDirtyFlags: [
    false,
    false,
  ],
});

export const FOLDER_WITH_SUITES = merge(FOLDER_BASE, {
  filePaths: [
    '-/path/to/folder/suite1.snap',
    '-/path/to/folder/suite2.snap',
    '-/path/to/folder/suite3.snap',
  ],
  suiteDirtyFlags: [
    false,
    false,
    false,
  ],
});

export const ROOT_FOLDER = {
  folderPath: '-',
  filePaths: [],
  suiteDirtyFlags: [],
  parentFolderPath: null,
  childrenFolderPaths: [
    '-/path/to/folder',
    '-/path/to/folder2',
  ],
  childrenFolderDirtyFlags: [
    false,
    false,
  ],
};

export const SUITE_WITH_INDIVIDUAL_SNAPSHOTS = {
  __folderPath: '-/path/to/folder',
  __dirty: false,
  __deleted: false,
  'individual1 1': {
    id: 'individual1 1',
    snap: 'contents3',
    css: [],
  },
  'individual2 1': {
    id: 'individual2 1',
    snap: 'contents4',
    css: [],
  },
};

export const SUITE_WITH_GROUPS_AND_INDIVIDUAL_SNAPSHOTS = {
  __folderPath: '-/path/to/folder',
  __dirty: false,
  __deleted: false,
  'groupname 1': {
    id: 'groupname 1',
    snap: 'contents1',
    css: [],
    dirty: false,
    deleted: false,
  },
  'groupname 2': {
    id: 'groupname 2',
    snap: 'contents2',
    css: [],
    dirty: false,
    deleted: false,
  },
  'individual1 1': {
    id: 'individual1 1',
    snap: 'contents3',
    css: [],
    dirty: false,
    deleted: false,
  },
  'individual2 1': {
    id: 'individual2 1',
    snap: 'contents4',
    css: [],
    dirty: false,
    deleted: false,
  },
};

export const SNAPSHOT_WITH_NO_HTML = {
  id: 'id1',
  snap: 'Snapshot contents',
  css: [],
  dirty: false,
  deleted: false,
};

export const SNAPSHOT_WITH_HTML = {
  id: 'id2',
  snap: 'Snapshot contents',
  html: '<div>Snapshot contents</div>',
  css: ['body { color: green }'],
  dirty: false,
  deleted: false,
};
