const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const con = require("../db/index");
const ss = require("sqlstring");
const bcrtypt = require("bcrypt");

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.get("/callers", (req, res) => {
  const { from, to, id, info } = req.query;
  const sql = ss.format(
    `SELECT DISTINCT
          cdr.Caller_id, count, c.icon, c.info
      FROM
          (SELECT 
              cdr.Caller_id, COUNT(cdr.Caller_id) AS count
          FROM
              cdr
          WHERE
              Timestamp BETWEEN ? AND ?
              AND cdr.caller_id like ?
          GROUP BY cdr.Caller_id) AS cdr
              INNER JOIN
          contacts c ON cdr.Caller_id = c.caller_id
          where IFNULL(c.info, '') like ?
      ORDER BY count DESC
      LIMIT 50`,
    [from.split("T")[0], to.split("T")[0], `%${id}%`, `%${info}%`]
  );
  // var sql = `select id, fname, lname, username, permission from users where username = ${ss.escape(body.username)} and password = ${ss.escape(body.password)}`;
  console.log("aquery: " + sql);
  con.query(sql, async (err, result, fields) => {
    console.log("result");
    if (err) {
      console.log("aa");
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({
        success: true,
        result: result,
      });
      // if (result.length > 0) {
      //   res.json({
      //     success: true,
      //     result: result,
      //   });
      // } else {
      //   res.json({
      //     success: true,
      //     msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
      //   });
      // }
    }
  });
});

router.post("/calls", (req, res) => {
  const body = req.body;
  console.log(body.ids);
  const sql = ss.format(
    `SELECT DISTINCT
    cdr.Caller_id,
    cdr.Receiver_id,
    cdr.Duration_s,
    c.icon,
    c.info,
    rc.icon as rc_icon,
    rc.info as rc_info
FROM
    cdr
        INNER JOIN
    contacts c ON cdr.Caller_id = c.caller_id
        INNER JOIN
    contacts rc ON cdr.Receiver_id = rc.caller_id
WHERE
    cdr.Caller_id IN (?)`,
    [body.ids]
  );
  const sql_received = ss.format(
    `SELECT DISTINCT
    cdr.Caller_id,
    cdr.Receiver_id,
    cdr.Duration_s,
    c.icon,
    c.info,
    rc.icon as rc_icon,
    rc.info as rc_info
FROM
    cdr
        INNER JOIN
    contacts c ON cdr.Caller_id = c.caller_id
        INNER JOIN
    contacts rc ON cdr.Receiver_id = rc.caller_id
WHERE
    cdr.Receiver_id IN (?)`,
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

router.get('/me', (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      res.json({
        success: false,
        msg: "token invalid",
      });
    } else {
      const sql = ss.format(`select id, firstname, lastname, username, created_at, updated_at, roles from users where id = ?`, [decoded.id]);
      con.query(sql, async (err, result, fields) => {
        if (err) {
          res.json({
            success: false,
            msg: err.message,
          });
        } else {
          res.json({
            success: true,
            me: result[0],
          });
        }
      });
    }
  });
})

router.post("/login", (req, res) => {
  const body = req.body;
  const sql = ss.format(`select * from users where username = ?`, [body.username]);
  con.query(sql, async (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      if (result.length > 0) {
        if (!compareHash(body.password, result[0].password)) {
          res.json({
            success: false,
            msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
          });
        }else{
          const token = jwt.sign(
            {
              id: result[0].id,
              username: result[0].username,
              roles: result[0].roles,
            },
            key,
            { expiresIn: "30d" }
          );
          res.json({
            success: true,
            token: token,
            user: result[0],
          });
        }
      } else {
        res.json({
          success: true,
          msg: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
        });
      }
    }
  });
});

router.get("/all", (req, res) => {
  const sql = `select u.id, u.firstname, u.lastname, u.username, u.roles, u.created_at, u.updated_at, cr.username as created_by, up.username as updated_by
                  from users u 
                  left join users cr on u.created_by_id = cr.id
                  left join users up on u.updated_by_id = up.id
                  order by u.created_at desc`;
  con.query(sql, async (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({
        success: true,
        result: result,
      });
    }
  });
});

function toHash(str){
  return bcrtypt.hashSync(str, 10);
}

function compareHash(str, hash){
  return bcrtypt.compareSync(str, hash);
}

router.post("/create", (req, res) => {
  const body = req.body;
  const sql = ss.format(
    `insert into users(firstname, lastname, username, password, roles, created_by_id) values(?, ?, ?, ?, ?, ?)`,
    [
      body.firstname,
      body.lastname,
      body.username,
      toHash(body.password),
      rolesToString(body.roles),
      body.createdById
    ]
  );
  con.query(
    "select * from users where username = ?",
    [body.username],
    (err, result, fields) => {
      if (result.length > 0) {
        res.json({
          success: false,
          msg: "Хэрэглэгч бүртгэгдсэн байна",
        });
      } else {
        con.query(sql, async (err, result, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: err.message,
            });
          } else {
            res.json({
              success: true,
            });
          }
        });
      }
    }
  );
});

router.post("/delete", (req, res) => {
  const body = req.body;
  const sql = ss.format(`delete from users where id = ?`, [body.id]);
  con.query(sql, async (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

function rolesToString(roles) {
  if (roles) {
    return roles.join(",");
  }
  return null;
}

router.post("/update", (req, res) => {
  const body = req.body;
  const sql = ss.format(
    `update users set firstname = ?, lastname = ?, username = ?, roles = ?, updated_by_id = ?, updated_at = current_timestamp where id = ?`,
    [
      body.firstname,
      body.lastname,
      body.username,
      rolesToString(body.roles),
      body.updatedById,
      body.id,
    ]
  );
  console.log(sql);
  con.query(sql, async (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

router.post("/resetPassword", (req, res) => {
  const body = req.body;
  const sql = ss.format(`update users set password = ?, updated_by_id = ?, updated_at = current_timestamp where id = ?`, [
    toHash(body.password),
    body.updatedById,
    body.id,
  ]);
  con.query(sql, async (err, result, fields) => {
    if (err) {
      res.json({
        success: false,
        msg: err.message,
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

module.exports = router;
