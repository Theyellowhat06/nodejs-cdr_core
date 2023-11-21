const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index');
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/getAll', (req, res) => {
    var body = req.body
    console.log(body)
    try{
        jwt.verify(body.token, key)
        var sql = `select * from prof order by id desc`;
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
        var sql = `select * from prof where id = ${ss.escape(body.id)} order by id desc`;
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
                        key: 'code',
                        value: result[0].code
                    },
                    {
                        label: 'Нэр (ENG)',
                        key: 'name_en',
                        value: result[0].name_en
                    },
                    {
                        label: 'Нэр',
                        key: 'name_mn',
                        value: result[0].name_mn
                    },
                    {
                        label: 'Үргэлжилэх хугацаа',
                        key: 'letter_time',
                        id: result[0].period_id,
                        default: result[0].letter_time,
                        value: [
                            {
                                key: '1',
                                value: '45 хоног'
                            },
                            {
                                key: '2',
                                value: '3 сар'
                            }
                        ]
                    },
                    {
                        label: 'Төлбөр',
                        key: 'price',
                        value: result[0].price
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
        var sql = `insert into prof(code, period_id, letter_time, name_mn, name_en, price)
        values(${ss.escape(body.data[0].value)}, ${ss.escape(body.data[3].id)}, ${ss.escape(body.data[3].default)}, ${ss.escape(body.data[1].value)}, ${ss.escape(body.data[2].value)}, ${ss.escape(body.data[4].value)});`;
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
        var sql = `update prof set period_id = ${ss.escape(body.data[3].id)}, code = ${ss.escape(body.data[0].value)}, letter_time = ${ss.escape(body.data[3].default)}, name_mn = ${ss.escape(body.data[2].value)}, name_en = ${ss.escape(body.data[1].value)}, price = ${ss.escape(body.data[4].value)} where id = ${ss.escape(body.id)};`;
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
        var sql = `delete from prof where id = ${ss.escape(body.id)}`;
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