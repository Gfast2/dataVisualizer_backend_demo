'use strict';

const fs = require('fs');
const os = require('os');
const http = require('http');

const networks = os.networkInterfaces();
let hostname = '';
Object.keys(networks).map((e, i) => {
  networks[e].map((el, id) => {
    if (el.family === 'IPv4' && el.address !== '127.0.0.1') {
      hostname = el.address;
    }
  });
});
const portNum = '8081';
const db = "./db.csv";

let idRead = 0;
const dbObj = (() => {
  const content = fs.readFileSync(db).toString();
  const lines = content.split('\n');
  return {
    "data":   lines[0].split(','),
    "signal": lines[1].split(',')
  };
})();
const dbLength = dbObj['data'].length;

// Generate Json object to response quest
const mkResponse = (res) => {
  const str = JSON.stringify({
    "index": idRead.toString(),
    "data":  dbObj['data'][idRead],
    "signal":dbObj['signal'][idRead],
    "final": idRead === (dbLength-1) ? '1' : '0'
  });
  if(idRead === (dbLength-1)) {
    idRead = 0;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(str);
};

// Zero the sequence play
const restart = res => {
  idRead = 0;
  mkResponse(res);
};

// increase index & generate response
const next = res => {
  idRead++;
  mkResponse(res);
};

const server = http.createServer((req, res) => {
  let url = req.url;
  res.setHeader('Access-Control-Allow-Origin', '*');
  switch (url) {
    case '/init':
    case '/reset':
      restart(res);
      break;
    case '/next':
      next(res);
      break;
    default:
      res.statusCode = 404;
      res.setHeader('Content-type', 'text/html');
      res.end('not found');
  }
});

server.listen(portNum, hostname, () => {
  console.log(`Server running at http://${hostname}:${portNum}`);
});