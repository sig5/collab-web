const configurations={'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
function peerReception(io)
{
    //establish a RTC p2p connection object
   const peerConnection=new RTCPeerConnection(configurations);
   io.on('offer',async (offer)=>{
       //on receiving an offer from sender set the description and create an answer and send it back to callee 
       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
       const answer= await peerConnection.createAnswer();
       await peerConnection.setLocalDescription(answer);
       io.emit('answer',answer);
       //now i know your capablities and you know mine;

       //ICE CANDIDATES- THIS SERVICE IS USED TO FIND APPROPRIATE CANDIDATES TO EXCHANGE CONNECTIVITY INFORMATION;
      

   });
   //local ice candidates
   peerConnection.on('icecandidate',event=>{
       io.emit('candidate',event.candidate);
   });
   io.on('candidate',(candidate)=>{
       peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
   })

   
}