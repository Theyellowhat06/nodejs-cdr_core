const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const con = require("../db/index");
const ss = require("sqlstring");
const BankAccountsProfile = require("../model/bank_accounts_profile");

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.get("/people", (req, res) => {
  const { from, to, id, info } = req.query;
  const sql = ss.format(
    `SELECT DISTINCT
    bank.bank_account_number, count, p.image, p.description
FROM
    (SELECT 
        bank_statements.sender_account_number AS bank_account_number,
            COUNT(bank_statements.sender_account_number) AS count
    FROM
        bank_statements
    WHERE
    transaction_date BETWEEN ? AND ?
              AND 
        bank_statements.sender_account_number LIKE ?
    GROUP BY bank_statements.sender_account_number UNION SELECT 
        bank_statements.receiver_account_number AS bank_account_number,
            COUNT(bank_statements.receiver_account_number) AS count
    FROM
        bank_statements
    WHERE
    transaction_date BETWEEN ? AND ?
              AND 
        bank_statements.receiver_account_number LIKE ?
    GROUP BY bank_statements.receiver_account_number) AS bank
        LEFT JOIN
    people p ON bank.bank_account_number = p.account_number
WHERE
    IFNULL(p.description, '') LIKE ?
ORDER BY count DESC
LIMIT 50`,
    [
      from.split("T")[0],
      to.split("T")[0],
      `%${id}%`,
      from.split("T")[0],
      to.split("T")[0],
      `%${id}%`,
      `%${info}%`,
    ]
  );
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
    `SELECT DISTINCT
    bank_statements.sender_account_number,
    bank_statements.receiver_account_number,
    IF(bank_statements.credit_amount > 0,
        bank_statements.credit_amount,
        bank_statements.debit_amount) AS amount,
    p.image,
    p.description,
    rp.image AS r_image,
    rp.description AS r_description
FROM
    bank_statements
        LEFT JOIN
    people p ON bank_statements.sender_account_number = p.account_number
        LEFT JOIN
    people rp ON bank_statements.receiver_account_number = rp.account_number
WHERE
    bank_statements.sender_account_number IN (?);`,
    [body.ids]
  );
  const sql_received = ss.format(
    `SELECT DISTINCT
    bank_statements.sender_account_number,
    bank_statements.receiver_account_number,
    IF(bank_statements.credit_amount > 0,
        bank_statements.credit_amount,
        bank_statements.debit_amount) AS amount,
    p.image,
    p.description,
    rp.image AS r_image,
    rp.description AS r_description
FROM
    bank_statements
        left JOIN
    people p ON bank_statements.sender_account_number = p.account_number
        left JOIN
    people rp ON bank_statements.receiver_account_number = rp.account_number
WHERE
    bank_statements.receiver_account_number IN (?)`,
    [body.ids]
  );
  console.log("query: " + sql);
  con.query(sql, (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: "parameter invalid",
      });
    } else {
      con.query(sql_received, (err, result_recieved) => {
        if (err) {
          res.json({
            success: false,
            msg: "parameter invalid",
          });
        } else {
          res.json({
            success: true,
            result: result,
            recieved_calls: result_recieved,
          });
        }
      });
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

const createPerson = async (accountNumber) => {
  const [person] = await con.query(
    ss.format("select id people where account_number = ?", accountNumber)
  );
  if (person.length > 0) return;

  await con.query(ss.format("insert into people(account_number)"));
};

const dateTimeConvertor = (rawDateTime) => {
  splitedDateTime = rawDateTime.split(" ");
  const [year, month, day] = splitedDateTime[0].split("/").map(Number);
  const [hours, minutes] = splitedDateTime[splitedDateTime.length - 1]
    .split(":")
    .map(Number);

  const dateTime = new Date(year, month - 1, day, hours, minutes);

  return dateTime.toISOString().slice(0, 19).replace("T", " ");
};

router.post("/excel_import", async (req, res) => {
  const {
    body: {
      data: { accountNumber, statements },
    },
  } = req;

  const sql = ss.format(
    "insert into bank_statements(transaction_date, branch_number, balance_before, balance_after, debit_amount, credit_amount, description, sender_account_number, receiver_account_number) values ?",
    [
      statements.map((d) => {
        return [
          dateTimeConvertor(d["Гүйлгээний огноо"]),
          d["Салбар"],
          parseFloat(d["Эхний үлдэгдэл"].replace(/,/g, "")),
          parseFloat(d["Эцсийн үлдэгдэл"].replace(/,/g, "")),
          parseFloat(d["Дебит гүйлгээ"].replace(/,/g, "")),
          parseFloat(d["Кредит гүйлгээ"].replace(/,/g, "")),
          d["Гүйлгээний утга"],
          accountNumber,
          d["Харьцсан данс"],
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

router.get(
  "/account_profile/:account_number",
  async ({ params: { account_number } }, res) => {
    try {
      const data = await BankAccountsProfile.find({ account_number });
      res.json({ result: data[0], success: true });
    } catch (error) {
      res.json({ success: false, error });
    }
  }
);

router.post(
  "/account_profile/:account_number",
  async ({ params: { account_number }, body }, res) => {
    console.log(account_number, body);
    try {
      const result = await BankAccountsProfile.findOneAndUpdate(
        { account_number },
        body,
        { upsert: true, new: true }
      );
      res.json({ success: true, result });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
