export type SnapshotT = {
  id: string,
  snap: string,
  html: string,
};

export type FilePathT = string;
export type FolderPathT = string;

export type FolderT = {
  folderPath: FolderPathT,
  filePaths: Array<FilePathT>,
  parentFolderPath: ?FolderPathT,
  childrenFolderPaths: Array<FolderPathT>,
};

export type SnapshotSuiteT = { [id: string]: SnapshotT };
