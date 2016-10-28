// @flow

import { mainStory, config } from 'storyboard/lib/withConsoleListener';
import program from 'commander';
import opn from 'opn';
import * as httpServer from './httpServer';
import * as extractor from './extractor';

config({ filter: 'extractor:INFO,*:DEBUG' });

const pkg = require('../../package.json');

const DEFAULT_PORT = 8080;
const DEFAULT_FILE_PATTERNS = [
  '**/*.snap',
  '!node_modules/**/*',
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
  .option('-f --file-patterns [patterns]', 'Glob patterns for snapshot files', DEFAULT_FILE_PATTERNS)
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
    filePatterns: cliOptions.filePatterns,
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
