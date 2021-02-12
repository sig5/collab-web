function broadcast(data){
let socket=io();
let user=JSON.parse(data);
const peers={};
const video=document.getElementById('local-vid');
const config={iceServers:[{urls:["stun:stun.l.google.com:19302"]}]};
navigator.getUserMedia({video:true,audio:true},(stream)=>{
    if(video)
    {
        video.srcObject=stream;
        socket.emit('broadcast',user.sub,user.name);
    }
},(error)=>{
    console.log("error connecting to media devices.");
});
//if watch event is received
socket.on('watch',(id)=>{
    //establish a RTC connection to the STUN server.
    const peer=new RTCPeerConnection(config);
    //mark in the dictionary
    peers[id]=peer;
    let stream=video.srcObject;
    // add the video and audio track to the established connection
    stream.getTracks().forEach((track)=>{peer.addTrack(track,stream)});
    //when appropiate connectivity candidate is found
    peer.onicecandidate=(e)=>{
        //send candidate to server
        if(e.candidate)
        socket.emit('candidate',id,e.candidate);
    }
    //create sdp description for connection
    //take sdp form ice server and send to peer
    peer.createOffer().then((sdp)=>{peer.setLocalDescription(sdp)}).then(()=>{
        socket.emit('offer',id,peer.localDescription);
    })
});
socket.on('answer',(id,answer)=>{
    //when receive an incoming description set it here.
    peers[id].setRemoteDescription(answer);
});
//when an ice candidate is received on the socket client
socket.on('candidate',(id,candidate)=>{
    peers[id].addIceCandidate(new RTCIceCandidate(candidate));
});
socket.on('disconnectPeer',(id)=>{
    peers[id].close();
    delete peers[id];
})

}