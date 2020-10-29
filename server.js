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
app.use(express.static('views/images'))
app.use(express.static('views/js'))
app.use(express.static('views/css'))
app.use(router);

const dotenv = require('dotenv');
dotenv.config();

app.post('/make_room',instance_check.is_in,(req,res)=>{
    let room=null;
    room=require('crypto').randomBytes(8).toString('hex').slice(0,8);
    return res.status(201).send({room_id:room});
});

app.get('/join_room',instance_check.is_in,(req,res)=>{
    console.log("trying to join");
let room= req.query.room_id;
if(room)
{res.cookie('room_id',room,{expires:new Date(Date.now()+3600000)});
res.status(301).redirect('/arena');}
else{
    res.status(301).redirect('/');
}
});
const server=http.listen(process.env.PORT,()=>{
    console.log(`server up on port ${process.env.PORT}`)
});

let listeners=[];
  
//pub sub;
// let pub=redis.createClient({host:"redis-16526.c81.us-east-1-2.ec2.cloud.redislabs.com",port:16526,password:"sakarsinghal"});
// let sub=redis.createClient({host:"redis-16526.c81.us-east-1-2.ec2.cloud.redislabs.com",port:16526,password:"sakarsinghal"});
//pub sub;
let pub=redis.createClient();
let sub=redis.createClient();
io.use(async function(socket,next){
 
    if(instance_check.f(socket.handshake)){
        console.log("here");
        next();
    }
    else {
        console.log("errorshake");
        next();
    }
  
    }).on('connection',(client)=>{    
        let room='abc';
        let user;
  
    console.log("new client connected");

    cookies=client.handshake.headers.cookie.split(';')
    cookies.forEach(element => {
        let a=element.split('=');
        a[0]=a[0].trim();

        if(a[0]=='room_id')
        room=a[1];
        if(a[0]=='user')
        user=a[1];
        
    });
    pub.set(room+"read","false");
    sub.subscribe(room);
    let key;
    pub.get(room,(err,res)=>{
        if(res)
        console.log(res.substr(0,10))
        key=res;  client.emit('cache',key);
    });
    pub.get(room+'list',(err,res)=>{
        if(res===null)
        {
        rooms=[];
        rooms.push(user);
        rooms=Array.from(new Set(rooms));
         pub.set(room+'list',JSON.stringify(rooms));  
        }
        else{
            lst=JSON.parse(res);
            lst.push(user);
            lst=Array.from(new Set(lst));
            pub.set(room+'list',JSON.stringify(lst));  

        }

    });
 let current=user;
    client.on('read-only',(message)=>{
        var state;
        pub.get(room+'read',(err,res)=>{
            console.log('result'+res);
            state=res;
            if(message.localeCompare('false')==0 && user.localeCompare(state)==0)
            {console.log('read not')
                pub.set(room+'read','false');
        }

        });
        console.log('making board readonly')
        if(message.localeCompare('true')==0)
        {pub.set(room+'read',user);
        
    }
       
  

    });
    client.on('disconnect',()=>{
        pub.get(room+'list',(err,res)=>{
            if(!(res===null))
            {
            rooms=JSON.parse(res);
            rooms=rooms.filter(item=>item!=user);
             pub.set(room+'list',JSON.stringify(rooms)); 
             console.log(rooms); 
            }
            else{
                console.log("lol");
    
            }
    
        });
        console.log('closed');
       
    });
  
    console.log('registered'+room)
    sub.on('message',(channel,message)=>{
        client.emit("data",message);
        console.log('message recieved on redis instance'+message.substr(1,100));
    });
  
    {client.on('message',(message)=>{
        pub.get(room+'read',(err,res)=>{
            console.log(res);
            if(res.localeCompare("false")==0)
            pub.publish(room,message);
            else if(current.localeCompare(res)==0)
            {
                console.log(user+res);
                pub.publish(room,message);
            }

        });
        //pub.publish(room,message);
    });
    
}
client.on('cache',(data)=>{
console.log("recieved cache")
    pub.set(room,data);
})
setInterval(async() => {
    pub.get(room+'list',(err,res)=>{
        console.log(res);
        client.emit('occupants',res);
    })
        
    },10000);
    
    
});
function x(message){
    
    pub.publish(room,message);
}
