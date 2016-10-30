// @flow

import { mainStory, config } from 'storyboard/lib/withConsoleListener';
import program from 'commander';
import opn from 'opn';
import * as httpServer from './httpServer';
import * as extractor from './extractor';

config({ filter: 'extractor:INFO,*:DEBUG' });

const pkg = require('../../package.json');

const DEFAULT_PORT = 8080;
const DEFAULT_SNAPSHOT_PATTERNS = [
  '**/*.snap',
  '!node_modules/**/*',
];
const DEFAULT_CSS_PATTERNS = [
  'snapshot.css',
];

process.on('SIGINT', () => {
  mainStory.debug('startup', 'CTRL-C received');
  process.exit(0);
});

// ==============================================
// Main
// ==============================================
program
  .version(pkg.version)
  .option('-f --snapshot-patterns [patterns]', 'Glob patterns for snapshot files',
    DEFAULT_SNAPSHOT_PATTERNS)
  .option('-c --css-patterns [patterns]', 'Glob patterns for CSS stylesheets ' +
    'that will be used for ALL snapshots', DEFAULT_CSS_PATTERNS)
  .option('-p, --port [port]', 'Initial port number to use ' +
    '(if unavailable, the next available one will be used)', Number, DEFAULT_PORT)
  .parse(process.argv);

const cliOptions = program.opts();

mainStory.info('startup', 'CLI options:', { attach: cliOptions });

let finalPort;
const httpInit = () =>
  httpServer.init({ port: cliOptions.port })
  .then((o) => { finalPort = o; });

const extractorInit = () => {
  extractor.configure({
    snapshotPatterns: cliOptions.snapshotPatterns,
    cssPatterns: cliOptions.cssPatterns,
  });
  return extractor.refresh();
};

Promise.all([
  httpInit(),
  extractorInit(),
])
.then(() => {
  opn(`http://localhost:${finalPort}/`);
});
