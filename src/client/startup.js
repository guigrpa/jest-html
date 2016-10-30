// @flow

/* eslint-env browser */

import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './components/000-root';

const rootElement = document.getElementById('app');

ReactDOM.render(<Root />, rootElement);
