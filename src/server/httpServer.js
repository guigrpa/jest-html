// @flow

/* eslint-disable import/prefer-default-export */

import path from 'path';
import http from 'http';
import { mainStory, chalk } from 'storyboard';
import express from 'express';
import bodyParser from 'body-parser';
import socketio from 'socket.io';
import * as extractor from './extractor';

const ASSET_PATH = '../public';
const ABS_ASSET_PATH = path.resolve(__dirname, ASSET_PATH);

let _socketioServer;

// Returns the final port that was found free
function init(options: {| port: number |}): Promise<number> {
  // Disable flow on Express
  const expressApp: any = express();
  expressApp.use(bodyParser.json());
  expressApp.use(express.static(ABS_ASSET_PATH));

  // API
  expressApp.post('/api/folder', (req, res) => {
    mainStory.debug('http', `REQ: ${chalk.cyan('/api/folder')}`, {
      attach: req.body,
      attachInline: true,
    });
    const { folderPath } = req.body;
    res.json(extractor.getFolder(folderPath));
  });
  expressApp.post('/api/suite', (req, res) => {
    mainStory.debug('http', `REQ: ${chalk.cyan('/api/suite ')}`, {
      attach: req.body,
      attachInline: true,
    });
    const { filePath } = req.body;
    res.json(extractor.getSnapshotSuite(filePath));
  });
  expressApp.post('/api/saveAsBaseline', (req, res) => {
    mainStory.debug('http', `REQ: ${chalk.cyan('/api/saveAsBaseline ')}`, {
      attach: req.body,
      attachInline: true,
    });
    const { filePath, id } = req.body;
    extractor.saveAsBaseline(filePath, id);
    res.json({});
  });

  // All other routes
  expressApp.use('*', (req, res) => {
    res.sendFile(path.join(ABS_ASSET_PATH, 'index.html'));
  });

  // Create HTTP server
  const httpServer = http.createServer(expressApp);

  // Create socket.io server
  _socketioServer = socketio(httpServer);
  _socketioServer.on('connection', () => {
    mainStory.debug('http', 'Socket connected');
  });

  // Look for a suitable port and start listening
  return new Promise((resolve, reject) => {
    let port = options.port;
    httpServer.on('error', () => {
      mainStory.warn('http', `Port ${port} busy`);
      port += 1;
      if (port >= options.port + 20) {
        mainStory.error('http', 'Cannot open port (tried 20 times)');
        reject(new Error('Could not open HTTP port'));
        return;
      }
      httpServer.listen(port);
    });
    httpServer.on('listening', () => {
      mainStory.info('http', `Listening on port ${chalk.cyan.bold(port)}`);
      resolve(port);
    });
    httpServer.listen(port);
  });
}

const getSocketioServer = () => _socketioServer;

// =============================================
// Public API
// =============================================
export { init, getSocketioServer };
