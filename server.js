const express = require('express')
const path= require('path')
const bodyparser=require('body-parser')
const router=require('./routes/router.js')
const cors=require('cors')
const app=express()
const http=require('http').Server(app)
const io=require('socket.io')(http);
const redis=require('redis');
const instance_check=require('./middleware/if_logged_in')
app.use(cors())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(express.static('views'))

app.use(router);
app.post('/make_room',instance_check.is_in,(req,res)=>{
    let room=null;
    room=require('crypto').randomBytes(8).toString('hex').slice(0,8);
    return res.status(201).send({room_id:room});
});
app.post('/join_room',instance_check.is_in,(req,res)=>{
    console.log("trying to join");
let room= req.body.room_id;
res.cookie('room_id',room,{expires:new Date(Date.now()+3600000)});
res.status(301).redirect('/arena');
});
const server=http.listen(3000,()=>{
    console.log("server up on port 3000")
});
//pub sub;
let pub=redis.createClient();
let sub=redis.createClient();
io.use(async function(socket,next){
    if(instance_check.f(socket.handshake)){
        console.log("here");
        next();
    }
    else {
        console.log("here");
     
        next();
    }
  
    }).on('connection',(client)=>{    
    console.log("new client connected");
    let room='abc';
    cookies=client.handshake.headers.cookie.split(';')
    cookies.forEach(element => {
        let a=element.split('=');
        a[0]=a[0].trim();
        console.log(a[0])
        if(a[0]=='room_id')
        room=a[1];
        
    });
    sub.subscribe(room);
    console.log('registered'+room)
    sub.on('message',(channel,message)=>{
        console.log('message recieved on redis instance');

        client.emit("data",message);
    });
    client.on('message',(message)=>{
        pub.publish(room,message);
    });
    
});