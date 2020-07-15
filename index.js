const express = require('express');
const path = require('path');
const server = express();
const port = 5000;

const statuses = ['pending', 'succeeded', 'failed']

// create helper middleware so we can reuse server-sent events
const useServerSentEventsMiddleware = (req, res, next) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // only if you want anyone to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.flushHeaders();

  const sendEventStreamData = (data) => {
    const sseFormattedResponse = `event: lendinvest.event.api_btl.check_completed\ndata: ${JSON.stringify(data)}\n\n`;
    res.write(sseFormattedResponse);
  };

  Object.assign(res, {
    sendEventStreamData,
  });

  next();
};

const streamRandomStatuses = (req, res) => {
  const interval = setInterval(function generateAndSendRandomNumber() {
    const data = {
      check_id: 'ea9ebf1d-85ca-46fa-98cc-4d0777f886c9',
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };

    res.sendEventStreamData(data);
  }, 5000);

  // close
  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });
};

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.get(
  '/.well-known/mercure',
  useServerSentEventsMiddleware,
  streamRandomStatuses
);

server.listen(port, () =>
  console.log(`Example app listening at 
    http://localhost:${port}`)
);
