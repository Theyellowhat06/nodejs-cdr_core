const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const con = require("../db/index");
const ss = require("sqlstring");

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post("/updateImage", (req, res) => {
  const { caller_id, icon } = req.body;
  console.log("update");
  const sql = ss.format(`update contacts set icon = ? where caller_id = ?`, [
    icon,
    caller_id,
  ]);
  // var sql = `select id, fname, lname, username, permission from users where username = ${ss.escape(body.username)} and password = ${ss.escape(body.password)}`;
  console.log("aquery: " + sql);
  con.query(sql, async (err, result, fields) => {
    console.log("result");
    if (err) {
      console.log("aa");
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

router.post("/info", (req, res) => {
  const { caller_id, info } = req.body;
  const sql = ss.format(`update contacts set info = ? where caller_id = ?`, [
    info,
    caller_id,
  ]);
  con.query(sql, async (err, result, fields) => {
    console.log("result");
    if (err) {
      console.log("aa");
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

router.post("/description", (req, res) => {
  const { caller_id, description } = req.body;

  const sql = ss.format(
    `select * from people where account_number = ?`,
    caller_id
  );
  con.query(sql, (err, result, fields) => {
    console.log(sql);
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      console.log(result);
      let sql;
      if (result.length > 0) {
        sql = ss.format(`update people set description = ? where id = ?`, [
          description,
          result[0].id,
        ]);
      } else {
        sql = ss.format(
          `insert into people(description, account_number) values(?,?)`,
          [description, caller_id]
        );
      }
      con.query(sql, (err, result, fields) => {
        if (err) {
          res.json({
            success: false,
            msg: "parameter invalid",
          });
        } else {
          res.json({
            success: true,
          });
        }
      });
    }
  });
});

router.post("/calls", (req, res) => {
  const body = req.body;
  console.log(body.ids);
  const sql = ss.format(
    "select distinct cdr.Caller_id, cdr.Receiver_id, cdr.Duration_s, c.icon, c.info from cdr inner join contacts c on cdr.Caller_id = c.caller_id where cdr.Caller_id in (?)",
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
  // console.log(dateNumber);
  const date = new Date((dateNumber - 25569) * 86400 * 1000);
  date.setHours(date.getHours() - 8);
  const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  // console.log(dateString);
  return dateString;
};
router.post("/excel_import", async (req, res) => {
  const body = req.body;

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
});

router.get("/calls_by_date", (req, res) => {
  const sql = ss.format(
    "select DATE_FORMAT(Timestamp, '%Y-%m-%d %H') as formated_date, count(id) as total_call, max(Duration_s) as max_dura, min(Duration_s) as min_dura, avg(Duration_s) as avg_dura from cdr where Timestamp between ? and ? group by formated_date order by formated_date",
    [req.query.from.split("T")[0], req.query.to.split("T")[0]]
  );
  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      res.json({
        success: true,
        result: result,
      });
    }
  });
});

router.get("/calls_by_receiver", (req, res) => {
  const sql = ss.format(
    "select * from cdr where Receiver_id = ? and Caller_id in (?)",
    [req.query.target, req.query.sources]
  );
  console.log(sql);
  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      res.json({
        success: true,
        result: result,
      });
    }
  });
});

router.post("/remove_all_records", async (req, res) => {
  const sql = ss.format("delete from cdr where id > 0");

  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
