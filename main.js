const http = require("http");
const express = require("express");
const app = express();
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser')

//app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
// require("dotenv").config();

// parse application/json
app.use(bodyParser.json())

const serverPort = process.env.PORT || 3009;
const server = http.createServer(app);
const WebSocket = require("ws");

let keepAliveId;

const wss =
  process.env.NODE_ENV === "production" || true 
    ? new WebSocket.Server({ server })
    : new WebSocket.Server({ port: 5001 });

wss.on("connection", function (ws, req) {
  console.log("Connection Opened");
  console.log("Client size: ", wss.clients.size);

  if (wss.clients.size === 1) {
    console.log("first connection. starting keepalive");
    keepServerAlive();
  }

  ws.on("message", (data) => {
    let stringifiedData = data.toString();
    if (stringifiedData === 'pong') {
      console.log('keepAlive');
      return;
    }
    broadcast(ws, stringifiedData, false);
  });

  ws.on("close", (data) => {
    console.log("closing connection");

    if (wss.clients.size === 0) {
      console.log("last client disconnected, stopping keepAlive interval");
      clearInterval(keepAliveId);
    }
  });
});

// Implement broadcast function because of ws doesn't have it
const broadcast = (ws, message, includeSelf) => {
  if (includeSelf) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};

/**
 * Sends a ping message to all connected clients every 50 seconds
 */
 const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('ping');
      }
    });
  }, 50000);
};


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/get-presign-url', async (req, res) => {
  const { fileName, fileType, key, bucket } = req.body;
  console.log('fileName: ', fileName);
  console.log('fileType: ', fileType);
 
  const filePath = `${key}/${fileName}`;
  let functionUrl = 'https://l6rc4odvoftygwhx4zlf7dwgwu0cldvr.lambda-url.us-east-1.on.aws/'; 
  console.log('functionUrl: ', functionUrl);

  // send data to lambda function 
  preSignUrl = await axios.post(functionUrl, {
    "file":filePath,
    "file_type":fileType,
    key,
    bucket
  });
  console.log('preSignUrl: ', preSignUrl.data);
  res.send(preSignUrl.data);

});

server.listen(serverPort);
console.log(`Server started on port ${serverPort} in stage ${process.env.NODE_ENV}`);


