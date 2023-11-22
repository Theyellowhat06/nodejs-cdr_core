var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "cdr_user",
    password: "Cdr!@#",
    database: "cdr_db"
});
con.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("db connected successfully")
    }
})
module.exports = con;