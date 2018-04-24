import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';

const server = express();
server.set('view engine', 'pug');
server.set('views', 'views');

server.get('/', (req, res) => {
  const appString = renderToString(React.createElement(App));
  res.render('index', {component: appString})
});

server.get('/ping', (req, res) => {
  res.send('pong');
})

export default server;