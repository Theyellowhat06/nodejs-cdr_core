const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index');
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/getAll', (req, res) => {
    var body = req.body
    console.log('teacher',body)
    try{
        jwt.verify(body.token, key)
        var sql = `select *, (select name from teacher_type where id = type_id) as type_name, 
                (select name from degree where id = degree_id) as degree_name, 
                (select name from position_ where id = position_id) as position_name 
                from teacher order by id desc`;
            console.log("query: "+sql)
            con.query(sql, (err, result, fields) => {
                if(err){
                    res.json({
                        success: false,
                        msg: "parameter invalid"
                    })
                }else{
                    
                    res.json({
                        success: true,
                        result: result,
                    })
                }
            })
    }catch{
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getById', (req, res) => {
    var body = req.body
    console.log(body)
    try{
        jwt.verify(body.token, key)
        var sql = `select *, (select name from teacher_type where id = type_id) as type_name, 
        (select name from degree where id = degree_id) as degree_name, 
        (select name from position_ where id = position_id) as position_name 
        from teacher where id = ${ss.escape(body.id)} order by id desc`;
        console.log("query: "+sql)
        con.query(sql, (err, result, fields) => {
            if(err){
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            }else{
                var arr = [
                    {
                      label: 'Код',
                      key: '',
                      value: result[0].code,
                    },
                    {
                      label: 'Албан тушаал',
                      key: '',
                      default: result[0].position_name,
                      id: result[0].position_id,
                      value: [
                        {
                            key: '1',
                            value: 'Захирал'
                        },
                        {
                            key: '2',
                            value: 'Ахлах багш'
                        },
                        {
                          key: '3',
                          value: 'Дадлагажигч'
                      }
                    ],
                    },
                    {
                      label: 'Овог',
                      key: '',
                      value: result[0].lname_mn,
                    },
                    {
                      label: 'Овог (ENG)',
                      key: '',
                      value: result[0].lname_en,
                    },
                    {
                      label: 'Нэр',
                      key: '',
                      value: result[0].fname_mn,
                    },
                    {
                      label: 'Нэр (ENG)',
                      key: '',
                      value: result[0].fname_en,
                    },
                    {
                      label: 'Утасны дугаар',
                      key: '',
                      value: result[0].phone,
                    },
                    {
                      label: 'Зэрэг',
                      key: '',
                      default: result[0].degree_name,
                      id: result[0].degree_id,
                      value: [
                        {
                            key: '1',
                            value: 'Бакалавр'
                        },
                        {
                            key: '2',
                            value: 'Магистр'
                        },
                        {
                          key: '3',
                          value: 'Доктор'
                      }
                    ]
                    },
                    {
                      label: 'Багшлах хэлбэр',
                      key: '',
                      default: result[0].type_name,
                      id: result[0].type_id,
                      value: [
                        {
                            key: '1',
                            value: 'Үндсэн'
                        },
                        {
                            key: '2',
                            value: 'Цагийн'
                        }
                    ]
                    },
                  ]
                var obj ={
                    code: 'Код',
                    name_en: 'Нэр',
                    name_mn: 'Нэр (ENG)',
                    letter_time: 'Үргэлжилэх хугацаа',
                    price: 'Төлбөр',
                }
                result[0].label = obj
                res.json({
                    success: true,
                    result: arr,
                })
            }
        })
    }catch{
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/add', (req, res) => {
    var body = req.body
    console.log(body)
    try{
        var sql = `insert into teacher(code, type_id, degree_id, position_id, fname_mn, fname_en, lname_mn, lname_en, phone)
        values(${ss.escape(body.data[0].value)}, ${ss.escape(body.data[8].id)}, ${ss.escape(body.data[7].id)}, ${ss.escape(body.data[1].id)}, ${ss.escape(body.data[4].value)}, ${ss.escape(body.data[5].value)}, ${ss.escape(body.data[2].value)}, ${ss.escape(body.data[3].value)}, ${ss.escape(body.data[6].value)});`;
        console.log("query: "+sql)
        con.query(sql, (err, result, fields) => {
            if(err){
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            }else{
                res.json({
                    success: true,
                    msg: "Амжилттай",
                })
            }
        })
    }catch{
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/edit', (req, res) => {
    var body = req.body
    console.log(body)
    try{
        var sql = `update teacher set code = ${ss.escape(body.data[0].value)}, position_id = ${ss.escape(body.data[1].id)}, lname_mn = ${ss.escape(body.data[2].value)}, lname_en = ${ss.escape(body.data[3].value)}, fname_mn = ${ss.escape(body.data[4].value)}, fname_en = ${ss.escape(body.data[5].value)}, phone = ${ss.escape(body.data[6].value)}, degree_id = ${ss.escape(body.data[7].id)}, type_id = ${ss.escape(body.data[8].id)} where id = ${ss.escape(body.id)};`;
        console.log("query: "+sql)
        con.query(sql, (err, result, fields) => {
            if(err){
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            }else{
                res.json({
                    success: true,
                    msg: "Амжилттай засварллаа",
                })
            }
        })
    }catch{
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/delete', (req, res) => {
    var body = req.body
    console.log(body)
    try{
        var sql = `delete from teacher where id = ${ss.escape(body.id)}`;
        console.log("query: "+sql)
        con.query(sql, (err, result, fields) => {
            if(err){
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            }else{
                res.json({
                    success: true,
                    msg: "Амжилттай устаглаа",
                })
            }
        })
    }catch{
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

module.exports = router