const configurations={'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
async function peerConnect(io){
//create a peer connection with appropriate configuration
let peerConnection=new RTCPeerConnection(configurations);
//added
io.on('answer',(answer)=>{
    let remoteDescription=new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDescription);
});
//create a sdp offer and set it locally
const offer=await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
//send the created offer to the other peer through signalling medium(WebSoockets)
io.emit('offer',offer);
}