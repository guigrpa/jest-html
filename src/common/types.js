// @flow

export type SnapshotT = {
  id: string,
  snap: string,
  html: string,
  css: Array<string>,
  dirty: boolean,
  deleted: boolean,
  baseline?: {
    snap: string,
    html: string,
  },
};

export type FilePathT = string;
export type FolderPathT = string;

export type FolderT = {
  parentFolderPath: ?FolderPathT,
  folderPath: FolderPathT,
  dirty: boolean,

  filePaths: Array<FilePathT>,
  suiteDirtyFlags: Array<boolean>,

  childrenFolderPaths: Array<FolderPathT>,
  childrenFolderDirtyFlags: Array<boolean>,
};

export type SnapshotSuiteT = {
  __folderPath: FolderPathT,
  __dirty: boolean,
  __deleted: boolean,
  [id: string]: SnapshotT,
};
