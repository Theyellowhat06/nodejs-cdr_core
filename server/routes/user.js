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
  con.query(sql, async (err, result, fields) => {
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
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const formatExcelDate = (dateNumber) => {
  if (typeof dateNumber === "string") return dateNumber;
  console.log(dateNumber);
  const date = new Date((dateNumber - 25569) * 86400 * 1000);
  console.log(date);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
router.post("/excel_import", async (req, res) => {
  const body = req.body;
  // console.log(body.data);
  console.log(body.data[0]);
  console.log(body.data[0]["Caller id"]);

  const sql = ss.format(
    "insert into cdr(Caller_id, Receiver_id, Duration_s, Caller_company, Receiver_company, Timestamp) values ?",
    [
      body.data.map((d) => {
        return [
          d["Caller id"],
          d["Receiver id"],
          d["Duration s."],
          d["Caller company"],
          d["Receiver company"],
          formatExcelDate(d["Timestamp"]),
        ];
      }),
    ]
  );

  // console.log(sql);

  con.query(sql, (err, result, fields) => {
    if (err) {
      console.log(err.message);
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      res.json({ success: true });
    }
  });

  // const sql = ss.format(
  //   "select distinct Caller_id, Receiver_id, Duration_s from cdr where Caller_id in (?)",
  //   [body.ids]
  // );
  // // var sql = `select id, fname, lname, username, permission from users where username = ${ss.escape(body.username)} and password = ${ss.escape(body.password)}`;
  // console.log("query: " + sql);
  // con.query(sql, (err, result, fields) => {
  //   if (err) {
  //     res.json({
  //       success: false,
  //       msg: "parameter invalid",
  //     });
  //   } else {
  //     if (result.length > 0) {
  //       console.log("hoho");
  //       res.json({
  //         success: true,
  //         result: result,
  //       });
  //     } else {
  //       res.json({
  //         success: true,
  //         msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
  //       });
  //     }
  //   }
  // });
});

module.exports = router;
