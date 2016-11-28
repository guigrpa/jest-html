// @flow

/* eslint-env browser */
import React from 'react';
import { BrowserRouter, Match, Miss } from 'react-router';
import App from './010-app';
import LargeMessage from './200-largeMessage';

// ==========================================
// Component
// ==========================================
const Root = () =>
  <BrowserRouter>
    <div>
      <Match exactly pattern="/" component={App} />
      <Match pattern="/suite/*" component={App} />
      <Match pattern="/folder/*" component={App} />
      <Miss render={() => (
        <LargeMessage>
          Ooops! 404!
        </LargeMessage>
      )} />
    </div>
  </BrowserRouter>;

// ------------------------------------------
// const style = {};

// ==========================================
// Public API
// ==========================================
export default Root;
