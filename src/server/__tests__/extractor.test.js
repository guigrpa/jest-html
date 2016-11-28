/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */

// import storyboard from 'storyboard';
import * as extractor from '../extractor';

// storyboard.config({ filter: '-*' });

describe('extractor', () => {
  describe('with no RT features', () => {
    beforeEach(() => {
      extractor.configure({
        snapshotPatterns: [
          'test/**/*.snap',
          'example.js.snap',
        ],
        cssPatterns: [
          'test/snapshot.css',
        ],
        watch: false,
      });
    });

    it('should parse folders', async () => {
      await extractor.start();
      const folder = extractor.getFolder('-/test/exampleSnapshots/a');
      expect(normalizeFolder(folder)).toMatchSnapshot();
      const folder2 = extractor.getFolder('-');
      expect(normalizeFolder(folder2)).toMatchSnapshot();
      const file = extractor.getSnapshotSuite('-/example.js.snap');
      expect(file).toMatchSnapshot();
    });
  });
});

const normalize = (str) => str.normalize('NFKD');
const normalizeFolder = (folder) => ({
  childrenFolderPaths: folder.childrenFolderPaths.map(normalize),
  filePaths: folder.filePaths.map(normalize),
  folderPath: folder.folderPath != null ? normalize(folder.folderPath) : null,
  parentFolderPath: folder.parentFolderPath != null ? normalize(folder.parentFolderPath) : null,
  dirty: folder.dirty,
});
