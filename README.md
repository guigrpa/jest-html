# jest-html [![Build Status](https://travis-ci.org/guigrpa/jest-html.svg?branch=master)](https://travis-ci.org/guigrpa/jest-html) [![npm version](https://img.shields.io/npm/v/jest-html.svg)](https://www.npmjs.com/package/jest-html)

Preview Jest snapshots right in your browser. **Compatible with Jest 17 and higher**

![Jest-HTML and Chrome's devtools](https://raw.githubusercontent.com/guigrpa/jest-html/master/docs/02.png)

## Why?

* **Preview of React component snapshots in your browser** (snapshots and browser devtools, yay!).
* **Compatible with non-React** snapshots as well.
* **Snapshot diffing (both HTML and raw)** and visible indicators that a descendant suite or snapshot has changed.
* **Custom CSS** stylesheets applicable to all snapshots or individual ones.
* **Intuitive navigation** through folders, snapshot suites, and even **snapshot groups** within a suite.
* **Real-time updates** whenever a snapshot or CSS file changes.
* **Quickly toggle** between the raw snapshots and the HTML previews.

## Installation

Add `jest-html` to your development dependencies:

```sh
$ npm install --save-dev jest-html

# or if you use yarn:
$ yarn add jest-html --dev
```

Add the following configuration to your `package.json`:

```json
{
  "jest": {
    "snapshotSerializers": ["jest-html"]
  },
  "scripts": {
    "jest-html": "jest-html"
  }
}
```

## Basic usage

By adding `jest-html` to your `snapshotSerializers`, HTML previews will be automatically appended to React component snapshots the next time you update them (`jest -u`).

To review your snapshots, run `npm run jest-html` (`yarn run jest-html`). This launches your default browser and opens the `jest-html` application.

To see all CLI options, run `node_modules/.bin/jest-html --help`:

```
  Usage: jest-html [options]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -f --snapshot-patterns [globs]  Glob patterns for snapshot files (comma-separated)
    -c --css-patterns [globs]       Glob patterns for CSS stylesheets that will be used for ALL snapshots (comma-separated)
    -p, --port [port]               Initial port number to use (if unavailable, the next available one will be used)
    --no-watch                      Do not watch initially detected snapshot and css files
```

By default, `jest-html` looks for snapshots under `**/*.snap,!node_modules/**/*`, but you can change this using the `--snapshot-patterns` argument.

## Adding custom CSS

`jest-html` allows the user to add custom CSS to all snapshots or individual ones.

If a `snapshot.css` file is present at your project root directory, it will be used for all snapshots. You can also modify this default via the `--css-patterns` CLI option (takes glob patterns, the same as `--snapshot-patterns`).

CSS can also be added to particular snapshot suites, by including a `.css` file in the same directory as the snapshot file. For example, `settings.js.css` will add CSS to the co-located `settings.js.snap` suite.

## [Changelog](https://github.com/guigrpa/jest-html/blob/master/CHANGELOG.md)

## License (MIT)

Copyright (c) [Guillermo Grau Panea](https://github.com/guigrpa) 2016-now

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
