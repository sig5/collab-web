function validity(req,res,next){
    username=req.body.username.toString();
    password=req.body.password.toString();
    if(username.length<6)
    {console.log(username);
        res.status(404).json({msg:'Username length shoud be greater than or equal to 6'});
        res.send();

    }
    else if(password.length<6)
    {
        res.status(404).json({msg:'password length shoud be greater than or equal to 6'});
        res.send();
    }
    else
    next();
}
module.exports=validity
