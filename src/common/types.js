export type SnapshotT = {
  id: string,
  snap: string,
  html: string,
  css: Array<string>,
};

export type FilePathT = string;
export type FolderPathT = string;

export type FolderT = {
  folderPath: FolderPathT,
  filePaths: Array<FilePathT>,
  parentFolderPath: ?FolderPathT,
  childrenFolderPaths: Array<FolderPathT>,
};

export type SnapshotSuiteT = {
  __folderPath: FolderPathT,
  [id: string]: SnapshotT,
};
