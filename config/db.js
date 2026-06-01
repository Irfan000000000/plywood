// const mysql = require("mysql");
// const dotenv = require("dotenv");
// dotenv.config();

// const connection = mysql.createConnection({
//     host: process.env.host, 
//     user: process.env.user,
//     password: process.env.password,
//     database: process.env.database
// });

// connection.connect((error) => {
//     if (error) {
//         console.error("Error connecting to database:", error.message);
//         process.exit(1); // Exit the application if unable to connect to the database
//     } else {
//         console.log("Connected to database successfully.");
//     }
// });
// module.exports = connection;


const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
    connectionLimit: 10, // Adjust the number of maximum connections as needed
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

pool.getConnection((error, connection) => {
    if (error) {
        console.error("Error connecting to database:", error.message);
        process.exit(1); // Exit the application if unable to connect to the database
    } else {
        console.log("Connected to database successfully.");
        connection.release(); // Release the connection as it's just for testing
    }
});

module.exports = pool;
