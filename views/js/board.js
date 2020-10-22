
//mode==0-> free draw
//mode==1 ->rectangle/shape?
//mode==2 -> text
//shapes transmit ni hoing

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
  document.getElementById('user').innerHTML=getCookie('user');
let socket=io();
let draw_stream=[];
let color_pen=[];
let to_board=[];
let to_size=[];
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
canvas.addEventListener("mousedown",(e)=>{
    is_mouse_pressed=true;
    if(mode==1 || mode==2)
    {
        lastx=e.pageX-canvas.offsetLeft;
        lasty=e.pageY-canvas.offsetTop;
    }
    else{
    draw(e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop,false);
}
});

canvas.addEventListener("mousemove",(e)=>{
    if(is_mouse_pressed){
    
     
        draw(e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop,true);
    }

});
canvas.addEventListener("mouseup",(e)=>{
    
    is_mouse_pressed=false;
    if(mode==1 || mode==2)
    {
        if(mode==1 && is_rect)
        {
            context.strokeRect(lastx,lasty,e.pageX-lastx-canvas.offsetLeft,e.pageY-lasty-canvas.offsetTop);
        }
        else if(mode==1 && is_circle)
        {
            context.beginPath();
            context.arc((lastx+e.pageX-canvas.offsetLeft)/2,(lasty+e.pageY-canvas.offsetTop)/2,Math.sqrt((e.pageX-lastx-canvas.offsetLeft)*(e.pageX-lastx-canvas.offsetLeft)+(e.pageY-lasty-canvas.offsetTop)*(e.pageY-lasty-canvas.offsetTop))/2,0,2*Math.PI,0);
            context.stroke();
        }
        else 
        {
           
            var fontArgs = context.font.split(' ');
            var newSize =Math.min(Math.abs(e.pageX-canvas.offsetLeft-lastx),Math.abs(e.pageY-canvas.offsetTop-lasty))+'px';
            context.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
            addtext(writetext,Math.min(lastx,e.pageX-canvas.offsetLeft),Math.max(lasty,e.pageY-canvas.offsetTop));
        }

        lastx=e.pageX-canvas.offsetLeft;lasty=e.pageY-canvas.offsetTop;
       
    }
    // if(mode==2){
    //     console.log(writetext);
    // addtext(writetext,e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop); }
    socket.emit('message',JSON.stringify({type:'data_stream',draw:draw_stream,user:getCookie('user')}));
    draw_stream.length=0;
    console.log("lok"+draw_stream);
        
 
 
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
    if(JSON.parse(message)['type'].localeCompare('to_circ')==0)
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
   draw_stream=[];
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
function addtext(text,x,y)
{
    let colortemp=context.fillStyle;
    context.fillStyle=context.strokeStyle;
    context.fillText(text,x,y);
    context.fillStyle=colortemp;
}
function settext()
{
    mode=2;
}
function updatetext()
{
    writetext=document.getElementById('drawtext').value;
    console.log(writetext);
 
}
function addimage()
{

}