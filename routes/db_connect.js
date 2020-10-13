const db=require('mysql')
conn=  db.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'collab_db'
});
conn.connect((err)=>{
    if(! err){
        console.log("Database connected..");
    }
    else{
        console.log("There was some issue connecting to the database");
        console.log(err)
    }
});
module.exports=conn;