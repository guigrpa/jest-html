// @flow

/* eslint-env browser */
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Switch } from 'react-router'; // eslint-disable-line
import App from './010-app';
import LargeMessage from './200-largeMessage';

// ==========================================
// Component
// ==========================================
const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/suite/*" component={App} />
      <Route path="/folder/*" component={App} />
      <Route render={() => <LargeMessage>Ooops! 404!</LargeMessage>} />
    </Switch>
  </Router>
);

// ==========================================
// Public
// ==========================================
export default Root;
