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
          '**/*.snap',
          '!node_modules/**/*',
          '!src/**/*',
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
      expect(folder).toMatchSnapshot();
      const folder2 = extractor.getFolder('-');
      expect(folder2).toMatchSnapshot();
      const file = extractor.getSnapshotSuite('-/example.js.snap');
      expect(file).toMatchSnapshot();
    });
  });
});
