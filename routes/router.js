express=require('express');
const dotenv = require('dotenv');
dotenv.config();
router=express.Router();
bcrypt=require('bcrypt'); 
jwt= require('jsonwebtoken');
const salt_r=10;
db=require('./db_connect.js')
valid=require('../middleware/check_valid');
let path=require('path')
instance_check=require('../middleware/if_logged_in').is_in
router.get('/',(req,res,next)=>{
    try{
        const data =req.headers.cookie.split(';');
        console.log(data);
        let parsed={}
        data.forEach(element => {
            element_p=element.split('=')
            parsed[element_p[0].trim()]=element_p[1];
        });
  
        let token=parsed["token"];
        console.log(token);
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        req.userData=decoded;
        next();
    }
    catch(err){
        console.log("error in session")
        res.cookie('user','',{maxAge:-1});
        res.cookie('token','',{maxAge:-1});
      next();
    }

},(req,res)=>{
    res.sendFile(path.normalize((__dirname+'/../views/home.html')));
});
router.post('/login',valid,async function(req,res){
    username=req.body.username;
    password=req.body.password;
    var quer='select * from users where username=\''+username+'\''+';';
    console.log(quer);
    db.query(quer,(err,result)=>{
        if(err)
        throw err;
        console.log(result);
        if(result.length){
            let SECRET_KEY=process.env.SECRET_KEY;
            console.log('{"user":"'+username+'"}'); 
            console.log('{"pass":"'+result[0]['password']+'"}');
            console.log(password);
            if(bcrypt.compareSync(password,result[0]['password']))
            {let payload=JSON.parse('{"user":"'+username+'"}');
            let token=jwt.sign(payload ,SECRET_KEY,{expiresIn: '1d'});
            res.cookie('token',token,{httpOnly:true,maxAge: 3600000});
            res.cookie('user',username,{maxAge: 3600000,httpOnly:false});
            
            res.redirect(301,'/rooms');
        }
            else{
                res.status(401).send({msg:"wrong credentials"});
            }
        }
        else{
            
            res.status(400).send({msg:'User not found'});
        }
    });
});
router.post('/signup',valid,async(req,res)=>{
//check if already exists
username=req.body.username;
password=await bcrypt.hash(req.body.password,salt_r);
mobile=req.body.email;
quer='select * from users where username='+db.escape(username);
db.query(quer,(err,result)=>{
    if(result.length){
        res.status(409).send({
            msg:"username already in use"
        });
        
    }
    else{
        quer='insert into users values('+db.escape(username)+','+db.escape(mobile)+','+db.escape(password)+')';
        db.query(quer,(err,result)=>{
            if(err)
            {  
                return res.status(400).send({msg:"Change your username"});
            }
            return res.status(201).send({msg:"Registration successful."});

        })
    }

})
});

router.get('/rooms',instance_check,(req,res)=>{
    res.sendFile(path.join(__dirname,'../views/rooms.html'));
});
router.get('/arena',instance_check,(req,res)=>{
    res.sendFile(path.join(__dirname,'../views/arena.html'));
});
router.get('/logout',(req,res)=>{
    res.cookie('user','',{maxAge:-1});
    res.cookie('token','',{maxAge:-1});
    res.status(301).redirect('/');
})
module.exports=router