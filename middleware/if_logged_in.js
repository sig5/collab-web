module.exports={
    
    is_in:function is_in(req,res,next){
    try{const dotenv = require('dotenv');
    dotenv.config();
        const data =req.headers.cookie.split(';');
        console.log(data);
        let parsed={}
        data.forEach(element => {
            element_p=element.split('=')
            parsed[element_p[0].trim()]=element_p[1];
        });
        console.log("CHECKING SESSION");
        let token=parsed["token"];
        console.log(token);
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        req.userData=decoded;
        next();
    }
    catch(err){
        console.log(err);
        console.log("invalid session");
        res.status(301).redirect('/');
    }
},
f:function f(req)
{
    try{
        const data =req.headers.cookie.split(';');
        console.log(data);
        let parsed={}
        data.forEach(element => {
            element_p=element.split('=')
            parsed[element_p[0].trim()]=element_p[1];
        });
        console.log(parsed);
        let token=parsed["token"];
        console.log(token);
        const decoded=jwt.verify(token,'AVISHKAR');
        req.userData=decoded;
        return true;
    }
    catch(err){        console.log(err);
        console.log("invalid session");
        return false;

    }
    
}}
