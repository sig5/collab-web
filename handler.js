//const server = require('./server')

let server=require('./server')
//configured to run 3 servers
const dotenv = require('dotenv');
dotenv.config();

server(process.env.PORT1);
server(process.env.PORT2);
server(process.env.PORT3);

