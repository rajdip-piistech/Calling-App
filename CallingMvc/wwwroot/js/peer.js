const localVideo = document.getElementById("localVideo");
const remoteVideosContainer = document.getElementById("remoteVideosContainer");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
const screenShareButton = document.getElementById("screenShareButton");
const muteButton = document.getElementById("muteButton");
const videoOffButton = document.getElementById("videoOffButton");
const peerIdDisplay = document.getElementById("peerIdDisplay");

let localStream;
let remoteStreams = {};
let peer;
let connections = {};
let isMuted = false;
let isVideoOff = false;

// Initialize PeerJS
peer = new Peer({
    host: "localhost", // Replace with your server's IP or domain
    port: 9000,
    path: "/",
    key: "peerjs"
});

peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
    peerIdDisplay.textContent = `Your Peer ID: ${id}`;
});

// Get local media (video and audio)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;
    })
    .catch(error => {
        console.error("Error accessing media devices:", error);
    });

// Handle incoming calls
peer.on("call", incomingCall => {
    incomingCall.answer(localStream);
    incomingCall.on("stream", stream => {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = stream;
        remoteVideo.autoplay = true;
        remoteVideosContainer.appendChild(remoteVideo);
        remoteStreams[incomingCall.peer] = remoteVideo;
    });
});

// Connect to multiple peers
callButton.addEventListener("click", function () {
    const peerIds = prompt("Enter the peer IDs of the people you want to call (comma-separated):");
    if (peerIds) {
        peerIds.split(",").forEach(peerId => {
            const call = peer.call(peerId.trim(), localStream);
            call.on("stream", stream => {
                const remoteVideo = document.createElement("video");
                remoteVideo.srcObject = stream;
                remoteVideo.autoplay = true;
                remoteVideosContainer.appendChild(remoteVideo);
                remoteStreams[peerId.trim()] = remoteVideo;
            });
            connections[peerId.trim()] = call;
        });
    }
});

// Hang up all calls
hangupButton.addEventListener("click", function () {
    Object.values(connections).forEach(call => call.close());
    remoteVideosContainer.innerHTML = "";
    remoteStreams = {};
    connections = {};
    hangupButton.disabled = true;
});

// Share screen
screenShareButton.addEventListener("click", function () {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = localStream;
        screenStream = null;
        screenShareButton.textContent = "Share Screen";
    } else {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(stream => {
                screenStream = stream;
                localVideo.srcObject = screenStream;
                screenShareButton.textContent = "Stop Sharing";

                Object.values(connections).forEach(call => {
                    call.peerConnection.getSenders().forEach(sender => {
                        if (sender.track.kind === "video") {
                            sender.replaceTrack(screenStream.getVideoTracks()[0]);
                        }
                    });
                });

                screenStream.getVideoTracks()[0].onended = () => {
                    localVideo.srcObject = localStream;
                    screenStream = null;
                    screenShareButton.textContent = "Share Screen";
                };
            })
            .catch(error => {
                console.error("Error sharing screen:", error);
            });
    }
});

// Mute/unmute audio
muteButton.addEventListener("click", function () {
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        isMuted = !isMuted;
        audioTracks[0].enabled = !isMuted;
        muteButton.textContent = isMuted ? "Unmute" : "Mute";
    }
});

// Turn video on/off
videoOffButton.addEventListener("click", function () {
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
        isVideoOff = !isVideoOff;
        videoTracks[0].enabled = !isVideoOff;
        videoOffButton.textContent = isVideoOff ? "Turn Video On" : "Turn Video Off";
        localVideo.style.display = isVideoOff ? "none" : "block";
    }
});