const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const con = require("../db/index");
const ss = require("sqlstring");

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.get("/callers", (req, res) => {
  const sql = ss.format(
    "select distinct Caller_id, count(Caller_id) as count from cdr where Timestamp between ? and ? group by Caller_id order by count desc limit 50",
    [req.query.from.split("T")[0], req.query.to.split("T")[0]]
  );
  // var sql = `select id, fname, lname, username, permission from users where username = ${ss.escape(body.username)} and password = ${ss.escape(body.password)}`;
  console.log("query: " + sql);
  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      if (result.length > 0) {
        console.log("hoho");
        res.json({
          success: true,
          result: result,
        });
      } else {
        res.json({
          success: true,
          msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
        });
      }
    }
  });
});

router.post("/calls", (req, res) => {
  const body = req.body;
  console.log(body.ids);
  const sql = ss.format(
    "select distinct Caller_id, Receiver_id, Duration_s from cdr where Caller_id in (?)",
    [body.ids]
  );
  // var sql = `select id, fname, lname, username, permission from users where username = ${ss.escape(body.username)} and password = ${ss.escape(body.password)}`;
  console.log("query: " + sql);
  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      if (result.length > 0) {
        console.log("hoho");
        res.json({
          success: true,
          result: result,
        });
      } else {
        res.json({
          success: true,
          msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
        });
      }
    }
  });
});

module.exports = router;
