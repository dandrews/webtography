'use strict';

const createServer = require('http').createServer;
const qsParse = require('querystring').parse;
const worker = require('./worker.js');

const Port = process.env.PORT || 3000;

function defaultResponse (response) {
  response.end('Please POST me a url, username and GitHub token');
}

function handler (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.setHeader('Access-Control-Allow-Headers', 'accept, origin, content-type');
  switch (request.method) {
    case 'OPTIONS':
      response.end();
      break;
    case 'POST':
      var body = '';
      request.on('data', (data) => {
        body += data;
        // keep it below 1mb
        if (body.length > 1e6) {
          response.writeHead(413);
          request.connection.destroy();
        }
      });
      request.on('end', () => {
        const post = qsParse(body);
        if (!post.url || !post.username || !post.token) {
          response.writeHead(409);
          return defaultResponse(response);
        }
        response.writeHead(201);
        response.end('I got this: ' + post.url);
        console.log('Working with', post.url, post.username, '...' + post.token.substr(-5));
        worker(post.url, post.username, post.token);
      });
      break;
    default:
      defaultResponse(response);
      break;
  }
}

createServer(handler).listen(Port, () => {
  console.log('HTTP server listening on port', Port);
});
