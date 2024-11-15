
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



 function openCamera() {
            const video = document.getElementById('cameraPreview');
            const captureButton = document.getElementById('captureButton');
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    video.style.display = 'block';
                    captureButton.style.display = 'block';
                    video.srcObject = stream;
                })
                .catch((error) => {
                    console.error('Error accessing camera:', error);
                    alert('Error accessing camera.');
                });
        }

        function captureMedia() {
            const video = document.getElementById('cameraPreview');
            const stream = video.srcObject;
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            
            imageCapture.takePhoto()
                .then(blob => {
                    track.stop(); // Stop the video stream
                    document.getElementById('fileInput').files = createFileList(blob);
                    alert('Photo captured successfully! Ready to upload.');
                })
                .catch(error => {
                    console.error('Error capturing photo:', error);
                    alert('Error capturing photo.');
                });
        }

        function createFileList(file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([file], 'captured-image.jpg', { type: file.type }));
            return dataTransfer.files;
        }

        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if (!file) {
                alert('Please select a file to upload.');
                return;
            }

            // Check file type to ensure it is MOV, MP4, or an image
            const validTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Only MOV, MP4, and image files are allowed.');
                return;
            }

            try {
                // Fetch a pre-signed URL from your server
                const presignResponse = await fetch('/generate-presigned-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type
                    })
                });

                if (!presignResponse.ok) {
                    throw new Error('Failed to get presigned URL');
                }

                const { uploadUrl } = await presignResponse.json();

                // Upload the file to S3 using the pre-signed URL
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type
                    },
                    body: file
                });

                if (uploadResponse.ok) {
                    alert('File uploaded successfully!');
                } else {
                    alert('Failed to upload file.');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error uploading file. Check console for details.');
            }
        }
