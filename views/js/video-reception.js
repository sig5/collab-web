
function view(room,data){
    let user=JSON.parse(data);
    const socket=io.connect(window.location.origin);
    let peer;
    const config={iceServers:[{urls:["stun:stun.l.google.com:19302"]}]};
    const video=document.getElementById('remote-video');

    socket.on('offer',(id,description)=>{
        //create a rtcpeer ins6tance
        peer=new RTCPeerConnection(config);
        //set remote description
        peer.setRemoteDescription(description).then(()=>{
            //create answer
            peer.createAnswer();
        }).then((sdp)=>peer.setLocalDescription(sdp)).then(()=>{
            socket.emit('answer',id,peer.localDescription);
        }) 
        peer.ontrack=(e)=>{
            video.srcObject=e.streams[0];
        };
        peer.onicecandidate=(e)=>{
            if(e.candidate)
            socket.emit('candidate',id,e.candidate);
        }
    });
    socket.on('candidate',(id,candidate)=>{
        peer.addIceCandidate(new RTCIceCandidate(candidate)).catch((e)=>{
            console.error(e);
        });
    })
    socket.on('broadcast',()=>{
        socket.emit('watch',room);
    });
    socket.on('disconnectPeer',()=>{
        peer.close();
    });
    socket.emit('watch',room);

}