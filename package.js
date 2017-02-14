/* eslint-disable strict, indent, max-len, quote-props */

'use strict';

// ===============================================
// Basic config
// ===============================================
const NAME = 'jest-html';
const VERSION = '1.3.3';
const DESCRIPTION = 'Preview Jest snapshots right in your browser';
const KEYWORDS = ['Jest', 'test', 'snapshot', 'serializer', 'html', 'preview'];

// ===============================================
// Helpers
// ===============================================
const runMultiple = (arr) => arr.join(' && ');
const runTestCov = (env, name) => {
  const envStr = env != null ? `${env} ` : '';
  return runMultiple([
    `cross-env ${envStr}jest --coverage`,
    `mv .nyc_output/coverage-final.json .nyc_tmp/coverage-${name}.json`,
  ]);
};

const WEBPACK_OPTIONS = '--config ./src/server/webpackConfig.cjs ' +
  '--progress ' +
  // '--display-modules ' +
  '--display-chunks';
const runWebpack = ({ fProduction, fWatch } = {}) => {
  const out = ['rm -rf ./public/assets'];
  const env = [];
  if (fProduction) env.push('NODE_ENV=production');
  const envStr = env.length ? `cross-env ${env.join(' ')} ` : '';
  const webpackOpts = `${WEBPACK_OPTIONS}${fWatch ? ' --watch' : ''}`;
  out.push(`${envStr}webpack ${webpackOpts}`);
  return runMultiple(out);
};

// ===============================================
// Specs
// ===============================================
const specs = {

  // -----------------------------------------------
  // General
  // -----------------------------------------------
  name: NAME,
  version: VERSION,
  description: DESCRIPTION,
  bin: {
    'jest-html': 'lib/previewer.js',
  },
  main: 'lib/serializer/',
  engines: {
    node: '>=6',
  },
  author: 'Guillermo Grau Panea',
  license: 'MIT',
  keywords: KEYWORDS,
  homepage: `https://github.com/guigrpa/${NAME}#readme`,
  bugs: {
    url: `https://github.com/guigrpa/${NAME}/issues`,
  },
  repository: {
    type: 'git',
    url: `git+https://github.com/guigrpa/${NAME}.git`,
  },

  // -----------------------------------------------
  // Scripts
  // -----------------------------------------------
  scripts: {

    // Top-level
    start:                      'babel-node src/server/startup',
    startProd:                  'node lib/previewer',  // sets NODE_ENV to PRODUCTION and runs
    compile:                    runMultiple([
                                  'rm -rf ./lib',
                                  'mkdir lib',
                                  'babel --out-dir lib --ignore "**/__mocks__/**","**/__tests__/**" src',
                                  // 'cp src/api.js.flow lib/translate.js.flow',
                                ]),
    docs:                       'extract-docs --template docs/templates/README.md --output README.md',
    buildWatch:                 runWebpack({ fWatch: true }),
    buildClient:                runWebpack({ fProduction: true }),
    build:                      runMultiple([
                                  'node package',
                                  'npm run lint',
                                  'npm run flow',
                                  'npm run compile',
                                  'npm run buildClient',
                                  'npm run test',
                                  'npm run docs',
                                  'npm run xxl',
                                ]),
    travis:                     runMultiple([
                                  'npm run compile',
                                  'npm run testCovFullExceptMin',
                                ]),

    // Static analysis
    lint:                       'eslint src',
    flow:                       'flow check || exit 0',
    xxl:                        'xxl',

    // Testing - general
    test:                       'npm run testCovFull',
    testCovFull:                runMultiple([
                                  'npm run testCovPrepare',
                                  'npm run testDev',
                                  'npm run testProd',
                                  'npm run testCovReport',
                                ]),
    testCovFullExceptMin:       runMultiple([
                                  'npm run testCovPrepare',
                                  'npm run testDev',
                                  'npm run testProd',
                                  'npm run testCovReport',
                                ]),
    testCovFast:                runMultiple([
                                  'npm run testCovPrepare',
                                  'npm run testDev',
                                  'npm run testCovReport',
                                ]),

    // Testing - steps
    jest:                       'jest --watch --coverage',
    jestDebug:                  'node --debug-brk --inspect node_modules/.bin/jest -i',
    testCovPrepare:             runMultiple([
                                  'rm -rf ./coverage .nyc_output .nyc_tmp',
                                  'mkdir .nyc_tmp',
                                ]),
    testDev:                    runTestCov('NODE_ENV=development', 'dev'),
    testProd:                   runTestCov('NODE_ENV=production', 'prod'),
    testMin:                    runTestCov('TEST_MINIFIED_LIB=1', 'min'),
    testCovReport:              runMultiple([
                                  'cp .nyc_tmp/* .nyc_output/',
                                  'nyc report --reporter=html --reporter=lcov --reporter=text',
                                ]),
  },


  // -----------------------------------------------
  // Deps
  // -----------------------------------------------
  dependencies: {
    timm: '^1.2.1',
    storyboard: '^3.0.0-rc.2',
    'storyboard-preset-console': '^3.0.0-rc.2',
    commander: '^2.9.0',

    'pretty-format': '^4.2.1',
    'escape-html': '1.0.3',
    'globby': '^6.0.0',
    opn: '4.0.2',
    chokidar: '1.6.1',
    'socket.io': '1.5.1',
    'lodash.debounce': '4.0.8',

    // Express
    express: '^4.14.0',
    'body-parser': '^1.15.2',

    // Polyfills
    'babel-polyfill': '6.16.0',
    'whatwg-fetch': '1.0.0',
  },

  peerDependencies: {
    jest: '>= 17.0.0',
  },

  devDependencies: {

    // Bundled
    react: '15.4.0',
    'react-dom': '15.4.0',
    'react-frame-component': '0.6.6',
    'react-router': '4.0.0-alpha.5',
    giu: '0.9.2',
    'socket.io-client': '1.5.1',
    moment: '^2.0.0',
    'node-uuid': '1.4.7',

    // Pure dev dependencies
    // ---------------------
    // Babel + plugins (except babel-eslint)
    'babel-cli': '6.16.0',
    'babel-core': '6.17.0',
    'babel-preset-es2015': '6.16.0',
    'babel-preset-stage-0': '6.16.0',
    'babel-preset-react': '6.16.0',

    // Webpack + loaders (+ related stuff)
    webpack: '1.13.2',
    'webpack-dev-middleware': '1.8.4',
    'webpack-hot-middleware': '2.13.0',
    'babel-loader': '6.2.5',
    'file-loader': '0.9.0',
    'css-loader': '0.25.0',
    'style-loader': '0.13.1',
    'json-loader': '0.5.4',
    'bundle-loader': '0.5.4',
    'sass-loader': '4.0.2',
    'node-sass': '3.10.1',
    'extract-text-webpack-plugin': '1.0.1',

    // Linting
    eslint: '3.8.1',
    'eslint-config-airbnb': '12.0.0',
    'eslint-plugin-flowtype': '2.20.0',
    'eslint-plugin-import': '1.16.0',
    'eslint-plugin-jsx-a11y': '2.2.3',
    'eslint-plugin-react': '6.4.1',
    'babel-eslint': '7.0.0',

    // Testing
    jest: '17.0.3',
    'babel-jest': '17.0.2',
    'react-test-renderer': '15.4.0',
    nyc: '8.3.0',
    coveralls: '2.11.14',

    // Other tools
    'extract-docs': '^1.3.0',
    'xxl': '^1.0.0',
    'cross-env': '2.0.1',
    'flow-bin': '0.35.0',
  },

  // -----------------------------------------------
  // Other configs
  // -----------------------------------------------
  jest: {
    // Default test path:
    // testRegex: '(/__tests__/.*|\\.(test|spec))\\.(js|jsx)$',
    testRegex: 'src/.*__tests__/.*\\.(test|spec)\\.(js|jsx)$',
    testPathDirs: ['<rootDir>/src'],
    moduleNameMapper: {
      '^.+\\.(css|less|sass)$': '<rootDir>/test/emptyObject.js',
      '^.+\\.(gif|ttf|eot|svg)$': '<rootDir>/test/emptyString.js',
      // 'node-uuid': '<rootDir>/test/mockUuid.js',
    },
    snapshotSerializers: ['<rootDir>/lib/serializer'],
    coverageDirectory: '.nyc_output',
    coverageReporters: ['json', 'text', 'html'],
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/previewer.js',
      '!src/client/startup.js',
      '!src/server/startup.js',
      '!src/server/webpackConfig.js',
      '!**/node_modules/**',
      '!**/__tests__/**',
      '!**/__mocks__/**',
    ],
    setupTestFrameworkScriptFile: './test/setup.js',
  },
};

// ===============================================
// Build package.json
// ===============================================
const _sortDeps = (deps) => {
  const newDeps = {};
  for (const key of Object.keys(deps).sort()) {
    newDeps[key] = deps[key];
  }
  return newDeps;
};
specs.dependencies = _sortDeps(specs.dependencies);
specs.devDependencies = _sortDeps(specs.devDependencies);
specs.peerDependencies = _sortDeps(specs.peerDependencies);
const packageJson = `${JSON.stringify(specs, null, '  ')}\n`;
require('fs').writeFileSync('package.json', packageJson);

/* eslint-enable strict, indent, max-len, quote-props */
