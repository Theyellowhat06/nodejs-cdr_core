const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
con.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("db connected successfully")
    }
})
module.exports = con;