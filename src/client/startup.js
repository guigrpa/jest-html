// @flow

/* eslint-env browser */

import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { setLocalStorageNamespace } from 'giu';
import Root from './components/000-root';

import 'font-awesome/css/font-awesome.min.css';
import 'typeface-gloria-hallelujah/index.css';

setLocalStorageNamespace('jest-html');
const container: any = document.getElementById('app');
ReactDOM.render(<Root />, container);
