
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
      let color = {};
      if ("r" in data) {
        color["r"] = data["r"];
      }
      if ("g" in data) {
        color["g"] = data["g"];
      }
      if ("b" in data) {
        color["b"] = data["b"];
      }

      console.log(color);
      // set background color
      // rgb from 0-1 to 0-255
      let colorString = `rgb(${color["r"] * 255}, ${color["g"] * 255}, ${color["b"] * 255})`;
      console.log(colorString);
      document.body.style.backgroundColor = colorString; 
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
