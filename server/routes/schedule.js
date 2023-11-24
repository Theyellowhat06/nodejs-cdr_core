const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index').default;
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/getClassNumber', (req, res) => {
    var body = req.body
    console.log(body)
    var sql = `select distinct class_number from schedule_`;
    console.log("query: " + sql)
    con.query(sql, (err, result, fields) => {
        if (err) {
            res.json({
                success: false,
                msg: "parameter invalid"
            })
        } else {
            if (result.length > 0) {
                res.json({
                    success: true,
                    result: result,
                })
            } else {
                res.json({
                    success: false,
                    msg: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна'
                })
            }
        }
    })
})

router.post('/getByClassNumber', (req, res) => {
    var body = req.body
    var week_day = [1, 2, 3, 4, 5, 6, 7]
    var part_time = [1, 2, 3, 4, 5, 6, 7, 8]
    var data = []
    console.log(body)
    var sql = `select * from schedule_ where class_number = ${body.class_number};`;
    console.log("query: " + sql)
    con.query(sql, (err, result, fields) => {
        if (err) {
            res.json({
                success: false,
                msg: "parameter invalid"
            })
        } else {
            if (result.length > 0) {
                week_day.forEach(e => {
                    let day = []
                    part_time.forEach(el => {
                        let found = false
                        let r = {}
                        result.forEach(row => {
                            if (e == row.week_day && el == row.part_time) {
                                found = true
                                r = row
                            }
                        });
                        if (found) day.push(r)
                        else day.push(0)
                    });
                    data.push(day)
                });
                res.json({
                    success: true,
                    result: data,
                })
            } else {
                res.json({
                    success: false,
                    msg: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна'
                })
            }
        }
    })
})

router.post('/getByTeacherCode', (req, res) => {
    var body = req.body
    var week_day = [1, 2, 3, 4, 5, 6, 7]
    var part_time = [1, 2, 3, 4, 5, 6, 7, 8]
    var data = []
    console.log(body)
    var sql = `select * from schedule_ where teacher_code = '${body.teacher_code}';`;
    console.log("query: " + sql)
    con.query(sql, (err, result, fields) => {
        if (err) {
            res.json({
                success: false,
                msg: "parameter invalid"
            })
        } else {
            if (result.length > 0) {
                week_day.forEach(e => {
                    let day = []
                    part_time.forEach(el => {
                        let found = false
                        let r = {}
                        result.forEach(row => {
                            if (e == row.week_day && el == row.part_time) {
                                found = true
                                r = row
                            }
                        });
                        if (found) day.push(r)
                        else day.push(0)
                    });
                    data.push(day)
                });
                res.json({
                    success: true,
                    result: data,
                })
            } else {
                res.json({
                    success: false,
                    msg: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна'
                })
            }
        }
    })
})

module.exports = router