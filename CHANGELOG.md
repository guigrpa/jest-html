## 1.5.0 (2018-8-15)

* Bump deps.

## 1.4.0 (2018-4-5)

* Previewer: improve rendering of JSON and Markdown contents (@revolunet, #7).

## 1.3.5 (2017-8-18)

* Bugfix: when a suite contains multiple dirty snapshots, marking one of them as the new baseline no longer marks the whole suite as clean.

## 1.3.4 (Feb. 14, 2017)

* Bump Storyboard dependency to v3.x.

## 1.3.3 (Dec. 15, 2016)

* Bugfix: remove all other sources from npm package to avoid Flow errors with transitive deps.

## 1.3.2 (Dec. 2, 2016)

* Bugfix: remove client-side sources from npm package to avoid Flow errors with transitive deps.

## 1.3.1 (Dec. 1, 2016)

* Bugfix: add babel-polyfill to the server side.

## 1.3.0 (Dec. 1, 2016)

* Previewer:
  * Support **snapshot visual diffing** (current snapshot contents vs. the baseline loaded when jest-html launches). Allow the user to save current snapshot as the new baseline.
  * Add usage hints.
  * Tweak layout.

## 1.2.2 (Nov. 18, 2016)

* Bump deps.

## 1.2.1 (Nov. 9, 2016)

* Update peerDependencies.

## 1.2.0 (Nov. 8, 2016)

* Serializer: improve spacing and indentation. Handles cases such as: boolean props, elements with 1 or 0 props (inlined), space-preserving styles (`whiteSpace: pre`), etc.

## 1.1.0 (Nov. 5, 2016)

* Serializer: support HTML self-closing tags.
* Previewer: add button to toggle between raw snapshot and HTML preview.
* Add Jest peer dependency.
* Bugfix: escape folder, suite, snapshot names for compatibility.

## 1.0.1 (Nov. 4, 2016)

* Bugfix: correct handling of `true` prop values, empty style attributes and null props.

## 1.0.0 (Nov. 2, 2016)

* Accept comma-separated globs as CLI arguments.
* Minor CSS fixes.

## 0.3.3 (Nov. 2, 2016)

* Fix push on Windows.

## 0.3.2 (Nov. 1, 2016)

* Improve client app architecture.
* Improve test coverage.

## 0.3.1 (Oct. 31, 2016)

* Much better watch support.
* Docs.

## 0.2.0 (Oct. 30, 2016)

* First public release of the preview application.

## 0.1.0 (Oct. 28, 2016)

* First public release of the serializer.
