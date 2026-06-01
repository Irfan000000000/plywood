const mysql =  require("mysql");
var dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.host, 
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
})

connection.connect((error)=>{

    if (error) throw "error";
   
})

module.exports = connection;
