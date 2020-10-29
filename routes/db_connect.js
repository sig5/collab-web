const db=require('mysql')
const dotenv = require('dotenv');
dotenv.config();
conn=  db.createConnection({
    host:process.env.db_url,
    user:process.env.db_user,
    password:process.env.db_pass,
    database:process.env.db_name
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