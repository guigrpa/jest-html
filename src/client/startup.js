// @flow

/* eslint-env browser */

import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/010-app';

const rootElement = document.getElementById('app');

ReactDOM.render(<App />, rootElement);
