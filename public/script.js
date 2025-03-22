
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');
const successMessage = document.getElementById('successMessage');


function showProgress() {
    progressBar.style.display = 'block';
}

function hideProgress() {
    progressBar.style.display = 'none';
}


let ws = new WebSocket('wss://tds.nu9ve.xyz/:443');
//
//let controllTD = document.querySelector('.controllTD') ;
//controllTD.addEventListener('input', (event) => {
//  ws.send(JSON.stringify({ 'slider1': controllTD.value / 100 }));
//}, false);
//
//let controlledByTD = document.querySelector('.controlledByTD');
//
ws.addEventListener('open', (event) => {
  console.log('Socket connection open');
  // alert('Successfully connected to socket server 🎉');
  ws.send('pong');
});

ws.addEventListener('message', (message) => {
  if (message && message.data) {
    console.log("got data", message.data);
    if (message.data === "ping") {
      console.log("got ping");
      ws.send("pong");
      return;
    }
    let data = JSON.parse(message.data);
    if (data) {
      //if ("slider1" in data) {
      //  controlledByTD.value = data["slider1"] * 100;
      //}
      //console.log("got data", data);
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

      //console.log(color);
      // set background color
      // rgb from 0-1 to 0-255
      let colorString = `rgb(${color["r"] * 255}, ${color["g"] * 255}, ${color["b"] * 255})`;
      console.log(colorString);
      document.body.style.backgroundColor = colorString; 

      if('artist' in data){
        document.getElementById('nowPlayingText').innerText = data['artist'];
      }
    }
  }
  console.log("message", message)
});

ws.addEventListener('error', (error) => {
    console.error('Error in the connection', error);
    //alert('error connecting socket server', error);
    openModal();
});

ws.addEventListener('close', (event) => {
    console.log('Socket connection closed');
    //alert('closing socket server');
    openModal();
});



const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            //document.getElementById('imagePreview').src = e.target.result;
            //document.getElementById('uploadButton').style.display = 'block';

            fileInput.style.display = 'none';
            showProgress();
            uploadFile();
        };
        reader.readAsDataURL(file);
    }
});


//
//function openCamera() {
//    const video = document.getElementById('cameraPreview');
//    const captureButton = document.getElementById('captureButton');
//    navigator.mediaDevices.getUserMedia({ video: true })
//        .then((stream) => {
//            video.style.display = 'block';
//            captureButton.style.display = 'block';
//            video.srcObject = stream;
//        })
//        .catch((error) => {
//            console.error('Error accessing camera:', error);
//            alert('Error accessing camera.');
//        });
//}
//
//function captureMedia() {
//    const video = document.getElementById('cameraPreview');
//    const stream = video.srcObject;
//    const track = stream.getVideoTracks()[0];
//    const imageCapture = new ImageCapture(track);
//
//    imageCapture.takePhoto()
//        .then(blob => {
//            track.stop(); // Stop the video stream
//            document.getElementById('fileInput').files = createFileList(blob);
//            alert('Photo captured successfully! Ready to upload.');
//        })
//        .catch(error => {
//            console.error('Error capturing photo:', error);
//            alert('Error capturing photo.');
//        });
//}
//
//function createFileList(file) {
//    const dataTransfer = new DataTransfer();
//    dataTransfer.items.add(new File([file], 'captured-image.jpg', { type: file.type }));
//    return dataTransfer.files;
//}

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
        console.log('Uploading file:', file.name);
        console.log('File type:', file.type);
        console.log('File size:', file.size);
        console.log('Last modified date:', file.lastModifiedDate);
        // Fetch a pre-signed URL from your server
        //
        const user = localStorage.getItem('user');
        const uploadName = user + '-' + Date.now() + '-' + file.name;
        const sanitizedFileName = uploadName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const finalName = sanitizedFileName;

        const presignResponse = await fetch('/get-presign-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: finalName,
                fileType: file.type,
                key: 'silo-night',
                bucket: 'silo-night'
            })
        });

        console.log('Presign response:', presignResponse);

        if (!presignResponse.ok) {
            throw new Error('Failed to get presigned URL');
        }

        const { presigned_url } = await presignResponse.json();

        console.log('Presigned URL:', presigned_url);

        const uploadUrl = presigned_url;
        console.log('Upload URL:', uploadUrl);

        // Upload the file to S3 using the pre-signed URL
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (uploadResponse.ok) {
            //alert('File uploaded successfully!');
            ws.send(JSON.stringify({ 
                'file': finalName, 
                'user': 'silo-night',
            }));

            fileInput.style.display = 'block';
            successMessage.style.display = 'block';
            hideProgress();
        } else {
            fileInput.style.display = 'block';
            //alert('Failed to upload file.');
            hideProgress();
            successMessage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        //alert('Error uploading file. Check console for details.');
        hideProgress();
        showModal();
        successMessage.style.display = 'none';
    }
}



const modal = document.getElementById('modal');

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}


