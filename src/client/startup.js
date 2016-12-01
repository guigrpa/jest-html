// @flow

/* eslint-env browser */

import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { setLocalStorageNamespace } from 'giu';
import Root from './components/000-root';

setLocalStorageNamespace('jest-html');
ReactDOM.render(<Root />, document.getElementById('app'));
