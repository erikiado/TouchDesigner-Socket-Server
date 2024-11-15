
let ws = new WebSocket('wss://tds.nu9ve.xyz/:443');

let controllTD = document.querySelector('.controllTD') ;
controllTD.addEventListener('input', (event) => {
  ws.send(JSON.stringify({ 'slider1': controllTD.value / 100 }));
}, false);

let controlledByTD = document.querySelector('.controlledByTD');

ws.addEventListener('open', (event) => {
  console.log('Socket connection open');
  // alert('Successfully connected to socket server 🎉');
  ws.send('pong');
});

ws.addEventListener('message', (message) => {
  if (message && message.data) {
    if (message.data === "ping") {
      console.log("got ping");
      ws.send("pong");
      return;
    }
    let data = JSON.parse(message.data);
    if (data) {
      if ("slider1" in data) {
        controlledByTD.value = data["slider1"] * 100;
      }
      console.log("got data", data);
      color = {};
      if ("r" in data) {
        color["r"] = parseFloat(data["r"]);
      }
      if ("g" in data) {
        color["g"] = parseFloat(data["g"]);
      }
      if ("b" in data) {
        color["b"] = parseFloat(data["b"]);
      }

      console.log(color);
      // set background color
      document.body.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
  }
  console.log("message", message)
});

ws.addEventListener('error', (error) => {
    console.error('Error in the connection', error);
    alert('error connecting socket server', error);
});

ws.addEventListener('close', (event) => {
    console.log('Socket connection closed');
    alert('closing socket server');
});
