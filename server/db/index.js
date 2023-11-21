var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "cdr",
  password: "Cdr!@#",
  database: "cdr"
});
con.connect((error) => {
    if(error){
        console.log(error)
    }else{
        console.log("db connected successfully")
    }
})
module.exports = con;