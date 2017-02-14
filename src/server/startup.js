// @flow

import 'babel-polyfill';
import 'storyboard-preset-console';
import { mainStory, config } from 'storyboard';
import program from 'commander';
import opn from 'opn';
import * as httpServer from './httpServer';
import * as extractor from './extractor';

config({ filter: '*:INFO' });

const pkg = require('../../package.json');

const DEFAULT_PORT = 8080;
const DEFAULT_SNAPSHOT_PATTERNS = '**/*.snap,!node_modules/**/*';
const DEFAULT_CSS_PATTERNS = 'snapshot.css';

process.on('SIGINT', () => {
  mainStory.debug('startup', 'CTRL-C received');
  process.exit(0);
});

// ==============================================
// Main
// ==============================================
program
  .version(pkg.version)
  .option('-f --snapshot-patterns [globs]',
    'Glob patterns for snapshot files (comma-separated)',
    DEFAULT_SNAPSHOT_PATTERNS)
  .option('-c --css-patterns [globs]',
    'Glob patterns for CSS stylesheets ' +
    'that will be used for ALL snapshots (comma-separated)',
    DEFAULT_CSS_PATTERNS)
  .option('-p, --port [port]', 'Initial port number to use ' +
    '(if unavailable, the next available one will be used)', Number, DEFAULT_PORT)
  .option('--no-watch', 'Do not watch initially detected snapshot and css files')
  .parse(process.argv);

const cliOptions = program.opts();
cliOptions.snapshotPatterns = cliOptions.snapshotPatterns.split(/\s*,\s*/);
cliOptions.cssPatterns = cliOptions.cssPatterns.split(/\s*,\s*/);

mainStory.info('startup', 'CLI options:', { attach: cliOptions });

let finalPort;
let socketioServer;
const httpInit = () =>
  httpServer.init({ port: cliOptions.port })
  .then((port) => {
    finalPort = port;
    socketioServer = httpServer.getSocketioServer();
  });

const extractorInit = () => {
  extractor.configure({
    snapshotPatterns: cliOptions.snapshotPatterns,
    cssPatterns: cliOptions.cssPatterns,
    watch: cliOptions.watch,
    socketioServer,
  });
  return extractor.start();
};

Promise.resolve()
.then(httpInit)
.then(extractorInit)
.then(() => { opn(`http://localhost:${finalPort}/`); });
