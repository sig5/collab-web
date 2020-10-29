
//mode==0-> free draw
//mode==1 ->rectangle/shape?
//mode==2 -> text
//mode==3 ->image

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
      direction: 'left',
      hoverEnabled: true
    });
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
  });

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
  });
  document.getElementById('user').innerHTML=getCookie('user')+'<i class="small material-icons">person</i>';
  document.getElementById('room').innerHTML=getCookie('room_id')+'<i class="small material-icons">weekend</i>';
let socket=io();
let draw_stream=[];
let color_pen=[];
let to_board=[];
let to_size=[];
let events=[];
let undone=[];
let mode=0;
var writetext="dummy";
let is_rect=false,is_circle=false;
var lastx,lasty;  
var canvas=document.getElementById('canvas');
canvas.style.padding=0;
canvas.setAttribute("id","canvas");
canvas.width=1500;
canvas.height=800;
document.getElementById("canvas_space").appendChild(canvas);
var context=canvas.getContext('2d');
context.fillStyle='rgb(255,255,255)';
context.fillRect(0,0,1500,800);
context.strokeStyle="#000000"
context.font='50px serif';
let is_mouse_pressed=false;
window.onload = function() {
    if ( window.orientation == 0 || window.orientation == 180 ) { 
        alert ('Please use your mobile device in landscape mode for a better experience'); 
    }
};
canvas.addEventListener("mousedown",(e)=>{
    is_mouse_pressed=true;
    let imgData=canvas.toDataURL('image/jpeg',1);
    events.push(imgData);

    if(mode==1 || mode==2)
    {
        lastx=e.pageX-canvas.offsetLeft;
        lasty=e.pageY-canvas.offsetTop;
    }
    else{
    draw(e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop,false);
}
});
canvas.addEventListener("touchstart",(e)=>{
    is_mouse_pressed=true;
    let imgData=canvas.toDataURL('image/jpeg',1);
    events.push(imgData);

    if(mode==1 || mode==2)
    {
        lastx=event.touches[0].pageX-canvas.offsetLeft;
        lasty=event.touches[0].pageY-canvas.offsetTop;
    }
    else{
    draw(event.touches[0].pageX-canvas.offsetLeft,event.touches[0].pageY-canvas.offsetTop,false);
}
});
canvas.addEventListener("mousemove",(e)=>{
    if(is_mouse_pressed){
    
     
        draw(e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop,true);
    }

});
canvas.addEventListener("touchmove",(e)=>{
    e.preventDefault();
    if(is_mouse_pressed){
    
     
        draw(event.touches[0].pageX-canvas.offsetLeft,event.touches[0].pageY-canvas.offsetTop,true);
    }

});
canvas.addEventListener("mouseup",(e)=>{
    e.preventDefault();
    is_mouse_pressed=false;
    if(mode==1 || mode==2)
    {
        if(mode==1 && is_rect)
        {

            makerectangle(lastx,lasty,e.pageX-lastx-canvas.offsetLeft,e.pageY-lasty-canvas.offsetTop);
            socket.emit('message',JSON.stringify({type:'rect_stream',draw:[lastx,lasty,e.pageX-lastx-canvas.offsetLeft,e.pageY-lasty-canvas.offsetTop],user:getCookie('user')}));
        }
        else if(mode==1 && is_circle)
        {
            makecircle((lastx+e.pageX-canvas.offsetLeft)/2,(lasty+e.pageY-canvas.offsetTop)/2,Math.sqrt((e.pageX-lastx-canvas.offsetLeft)*(e.pageX-lastx-canvas.offsetLeft)+(e.pageY-lasty-canvas.offsetTop)*(e.pageY-lasty-canvas.offsetTop))/2);
            socket.emit('message',JSON.stringify({type:'circle_stream',draw:[(lastx+e.pageX-canvas.offsetLeft)/2,(lasty+e.pageY-canvas.offsetTop)/2,Math.sqrt((e.pageX-lastx-canvas.offsetLeft)*(e.pageX-lastx-canvas.offsetLeft)+(e.pageY-lasty-canvas.offsetTop)*(e.pageY-lasty-canvas.offsetTop))/2],user:getCookie('user')}));
  
        }
        else 
        {let x1=e.pageX-canvas.offsetLeft;
            let x2=lastx;
            let y1=e.pageY-canvas.offsetTop;
            let y2=lasty;
            textwriter(x1,x2,y1,y2);
            socket.emit('message',JSON.stringify({type:'text_stream',draw:[x1,x2,y1,y2,writetext],user:getCookie('user')}));
  
           
        }

        lastx=e.pageX-canvas.offsetLeft;lasty=e.pageY-canvas.offsetTop;
       
    }
    if(mode==0)
    {socket.emit('message',JSON.stringify({type:'data_stream',draw:draw_stream,user:getCookie('user')}));
    draw_stream.length=0;}
    // console.log("lok"+draw_stream);
        
 
 
});
canvas.addEventListener("touchend",(e)=>{
    e.preventDefault();
    is_mouse_pressed=false;
    if(mode==1 || mode==2)
    {
        if(mode==1 && is_rect)
        {

            makerectangle(lastx,lasty,event.touches[0].pageX-lastx-canvas.offsetLeft,event.touches[0].pageY-lasty-canvas.offsetTop);
            socket.emit('message',JSON.stringify({type:'rect_stream',draw:[lastx,lasty,event.touches[0].pageX-lastx-canvas.offsetLeft,event.touches[0].pageY-lasty-canvas.offsetTop],user:getCookie('user')}));
        }
        else if(mode==1 && is_circle)
        {
            makecircle((lastx+e.pageX-canvas.offsetLeft)/2,(lasty+e.pageY-canvas.offsetTop)/2,Math.sqrt((e.pageX-lastx-canvas.offsetLeft)*(e.pageX-lastx-canvas.offsetLeft)+(e.pageY-lasty-canvas.offsetTop)*(e.pageY-lasty-canvas.offsetTop))/2);
            socket.emit('message',JSON.stringify({type:'circle_stream',draw:[(lastx+event.touches[0].pageX-canvas.offsetLeft)/2,(lasty+event.touches[0].pageY-canvas.offsetTop)/2,Math.sqrt((event.touches[0].pageX-lastx-canvas.offsetLeft)*(event.touches[0].pageX-lastx-canvas.offsetLeft)+(event.touches[0].pageY-lasty-canvas.offsetTop)*(event.touches[0].pageY-lasty-canvas.offsetTop))/2],user:getCookie('user')}));
  
        }
        else 
        {let x1=event.touches[0].pageX-canvas.offsetLeft;
            let x2=lastx;
            let y1=event.touches[0].pageY-canvas.offsetTop;
            let y2=lasty;
            textwriter(x1,x2,y1,y2);
            socket.emit('message',JSON.stringify({type:'text_stream',draw:[x1,x2,y1,y2,writetext],user:getCookie('user')}));
  
           
        }

        lastx=event.touches[0].pageX-canvas.offsetLeft;lasty=event.touches[0].pageY-canvas.offsetTop;
       
    }
    if(mode==0)
    {socket.emit('message',JSON.stringify({type:'data_stream',draw:draw_stream,user:getCookie('user')}));
    draw_stream.length=0;}
    // console.log("lok"+draw_stream);
        
 
 
});
function eraser(size,num){
    change_brush_size(size,1);
    context.strokeStyle=context.fillStyle;
    if(num==1)
    {
        color_pen.push(context.strokeStyle);
        socket.emit('message',JSON.stringify({type:'color_pen',color_pen:color_pen}));
        color_pen=[];
    }
}
function draw(x,y, drawing){
    if(mode==0)
    {if(drawing)
    {context.beginPath();
        s=({x,y,lastx,lasty});
      draw_stream.push(s);
    context.lineJoin="round";
    context.moveTo(lastx,lasty);
    context.lineTo(x,y);
    context.closePath();
    context.stroke();}
 
lastx=x,lasty=y;}
}
socket.on('cache',(data)=>{
    
    var img = new Image;
img.onload = function(){
  context.drawImage(img,0,0);
};
img.src = data;

})
socket.on("data",(message)=>{
    console.log("recieving..."+message);
    if(JSON.parse(message)['type'].localeCompare('color_pen')==0)
    {
        console.log(JSON.parse(message));
        change_color(JSON.parse(message)['color_pen'][0],0);
    }
    if(JSON.parse(message)['type'].localeCompare('to_pen')==0)
    {
        change_to_pen(0);
    }
    if(JSON.parse(message)['type'].localeCompare('to_rect')==0)
    {
        change_to_rect(0);
    }
    if(JSON.parse(message)['type'].localeCompare('to_circle')==0)
    {
        change_to_circle(0);
    }
    if(JSON.parse(message)['type'].localeCompare('to_board')==0)
    {
        change_board_color(JSON.parse(message)['to_board'][0],0);
    }
    if(JSON.parse(message)['type'].localeCompare('to_size')==0)
    {
        change_brush_size(JSON.parse(message)['to_size'][0],0);
    }
    if(JSON.parse(message)['type'].localeCompare('data_stream')==0)
    draw_recieved(message,JSON.parse(message)['user']);
    else console.log('oops')
    if(JSON.parse(message)['type'].localeCompare('chat')==0)
    {
        showchat(JSON.parse(message)['message'],JSON.parse(message)['user']);
    }
    if(JSON.parse(message)['type'].localeCompare('totext')==0)
    {
        settext(1);
    }
    if(JSON.parse(message)['type'].localeCompare('rect_stream')==0)
    {
        let dummy=JSON.parse(message)['draw']
        if(dummy.length==4)
        makerectangle(dummy[0],dummy[1],dummy[2],dummy[3]);
    }
    if(JSON.parse(message)['type'].localeCompare('circle_stream')==0)
    {
        let dummy=JSON.parse(message)['draw']
        if(dummy.length==3)
        makecircle(dummy[0],dummy[1],dummy[2]);
    }
    if(JSON.parse(message)['type'].localeCompare('text_stream')==0)
    {
        let dummy=JSON.parse(message)['draw']
        if(dummy.length==5)
        {writetext=dummy[4];
        textwriter(dummy[0],dummy[1],dummy[2],dummy[3]);}
    }
    if(JSON.parse(message)['type'].localeCompare('state')==0)
    {
        let dummy=JSON.parse(message)['draw'];

var img = new Image;
img.onload = function(){
  context.drawImage(img,0,0);
};
img.src = dummy;
    
    }
});
socket.on('occupants',(message)=>{
console.log(message);
lst=JSON.parse(message);
document.getElementById('occ').innerHTML=lst.length;
document.getElementById("participants").innerHTML="";
lst.forEach(element => {
    let a=document.createElement('a');
    a.innerHTML=element;
    document.getElementById("participants").appendChild(a);
    document.getElementById("participants").appendChild(document.createElement('br'));

});


});
function draw_recieved(data,user_id)
{
    if(user_id.localeCompare(getCookie('user'))!=0)
   { DATA=JSON.parse(data);
    console.log(data+"recieved");
    DATA=DATA["draw"];
    console.log(DATA);
    for (i=0;i<DATA.length;i++)
    {lastx=DATA[i]['lastx'],lasty=DATA[i]['lasty'];
    draw(DATA[i]['x'],DATA[i]['y'],true);}
   }
   draw_stream.length=0;
}
function save_image()
{
    download=document.getElementById("saver");
    download.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    
}
function change_to_rect(num){
    mode=1;
    is_circle=false;
    is_rect=true;
    if(num==1)
    {
        socket.emit('message',JSON.stringify({type:'to_rect'}));
    }
}
function change_to_circle(num){
    mode=1;
    is_circle=true;
    is_rect=false;
    if(num==1)
    {
        socket.emit('message',JSON.stringify({type:'to_circle'}));
    }
}

function change_to_pen(num)
{
    mode=0;
    is_rect=false;
    is_circle=false;
    if(num==1)
    {
        socket.emit('message',JSON.stringify({type:'to_pen'}));
    }
}
function change_color(color,num)
{
    context.strokeStyle=color;
    if(num==1)
    {
        color_pen.push(color);
        socket.emit('message',JSON.stringify({type:'color_pen',color_pen:color_pen}));
        color_pen=[];
    }
}
function change_board_color(color,num){
    context.fillStyle=color;
    context.fillRect(0,0,1500,800);
    if(num==1)
    {
        to_board.push(color);
        socket.emit('message',JSON.stringify({type:'to_board','to_board':to_board}));
        to_board=[];
    }
}

function change_brush_size(size,num)
{
    context.lineWidth=parseInt(size);
    console.log(context.lineWidth);
    if(num==1)
    {
        to_size.push(size);
        socket.emit('message',JSON.stringify({type:'to_size','to_size':to_size}));
        to_size=[];
    }
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function showchat(message,user)
  {
      var chat=document.createElement('div');
      chat.setAttribute('class','chat-item card');
      //chat.setAttribute('class','card');
      chat.innerHTML=user+': '+message;
      document.getElementById('chatbox').appendChild(chat);
}
  function sendchat()
  { message=document.getElementById('sendput').value;
    socket.emit('message',JSON.stringify({type:'chat',message:message,user:getCookie('user')}));
    document.getElementById('sendput').value=""
  }
function textwriter(x1,x2,y1,y2)
{
    var fontArgs = context.font.split(' ');
    var newSize =Math.min(Math.abs(x1-x2),Math.abs(y1-y2))+'px';
    context.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
    addtext(writetext,Math.min(x1,x2),Math.max(y1,y2));
    
}
function addtext(text,x,y)
{
    let colortemp=context.fillStyle;
    context.fillStyle=context.strokeStyle;
    context.fillText(text,x,y);
    context.fillStyle=colortemp;
}
function settext(num)
{
    mode=2;
    if(num==0)
    {
        socket.emit('message',JSON.stringify({type:'totext',user:getCookie('user')}));
    }
}
function updatetext()
{
    writetext=document.getElementById('drawtext').value;
 
}
function addimage(x1,x2,y1,y2,imgObj)
{
    context.drawImage(img,min(x1,x2),max(y1,y2),Math.abs(x2-x1),Math.min(y2-y1));
}
function makerectangle(x1,y1,w,h)
{
    context.strokeRect(x1,y1,w,h);
}
function makecircle(x1,y1,r)
{
    context.beginPath();
    context.arc(x1,y1,r,0,2*Math.PI,0);
    context.stroke();
}
setInterval(async() => {
let imgData=canvas.toDataURL('image/jpeg',1); 
socket.emit('cache',imgData);
console.log('sent');
    
},5000);

function undo(){
let a=events.pop();
let imgData=canvas.toDataURL('image/jpeg',1);
undone.push(imgData);
var img = new Image;
img.onload = function(){
  context.drawImage(img,0,0);
};
img.src = a;
setTimeout(()=>{
    socket.emit('message',JSON.stringify({type:'state',draw:canvas.toDataURL('image/jpeg',1)}));
    },500);

}
function redo()
{
let a=undone.pop();
let imgData=canvas.toDataURL('image/jpeg',1);
events.push(imgData);
var img = new Image;
img.onload = function(){
  context.drawImage(img,0,0);
};
img.src = a;
setTimeout(()=>{
socket.emit('message',JSON.stringify({type:'state',draw:canvas.toDataURL('image/jpeg',1)}));
},500);

}
function readonly()
    {
        socket.emit('read-only','true');
    }
    function readonlynot()
    {
        socket.emit('read-only','false');
    }