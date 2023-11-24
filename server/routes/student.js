const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index').default;
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/getAll', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    try {
        jwt.verify(body.token, key)
        var sql = `select * from student order by id desc`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {

                res.json({
                    success: true,
                    result: result,
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getGrade', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    var student_code = body.student_code.replace('*', '')
    try {
        jwt.verify(body.token, key)
        var sql = `select distinct s.subject_code, (select name_mn from subject_ where code = s.subject_code) as name, (select grade from student_grade as sg where sg.subject_code = s.subject_code and sg.student_code = '${student_code}') as grade from schedule_ as s where teacher_code = '${body.teacher_code}'`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {

                res.json({
                    success: true,
                    result: result,
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})
router.post('/getGradeByStudent', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    var student_code = body.student_code.replace('*', '')
    try {
        jwt.verify(body.token, key)
        var sql = `select *, (select name_mn from subject_ where code = subject_code) as name from student_grade where student_code = '${body.student_code}';`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {

                res.json({
                    success: true,
                    result: result,
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/setGrade', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    var student_code = body.student_code.replace('*', '')
    try {
        body.data.forEach((element, index) => {
            var sql = `select * from student_grade where subject_code = '${element.subject_code}' and student_code = '${student_code}'`;
            console.log("query: " + sql)
            con.query(sql, (err, result, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        msg: "parameter invalid"
                    })
                } else {
                    if (result.length > 0) {

                        sql = `update student_grade set grade = '${element.grade}', letter_grade = '${letter_grade(element.grade)}' where subject_code = '${element.subject_code}' and student_code = '${student_code}'`
                        console.log(sql)
                        con.query(sql, (err, result, fields) => {
                            console.log(index + 1, body.data.length)
                            if (err) {

                            } else if (index + 1 >= body.data.length) {
                                res.json({
                                    success: true,
                                    msg: 'Амжилттай',
                                })
                            }
                        })
                    } else {
                        sql = `insert into student_grade(teacher_code, student_code, subject_code, grade, letter_grade)
                        values('${body.teacher_code}', '${student_code}', '${element.subject_code}', '${element.grade}', '${letter_grade(element.grade)}')`;
                        con.query(sql, (err, result, fields) => {
                            console.log(index + 1, body.data.length)
                            if (err) {

                            } else if (index + 1 >= body.data.length) {
                                res.json({
                                    success: true,
                                    msg: 'Амжилттай',
                                })
                            }
                        })
                    }
                    // res.json({
                    //     success: true,
                    //     result: result,
                    // })
                }
            })
        });

    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

function letter_grade(grade) {
    var letter = 'F';
    if (grade < 60) {

    } else if (grade < 63) {
        letter = '-D'
    } else if (grade < 67) {
        letter = 'D'
    } else if (grade < 70) {
        letter = '+D'
    } else if (grade < 73) {
        letter = '-C'
    } else if (grade < 77) {
        letter = 'C'
    } else if (grade < 80) {
        letter = '+C'
    } else if (grade < 83) {
        letter = '-B'
    } else if (grade < 87) {
        letter = 'B'
    } else if (grade < 90) {
        letter = '+B'
    } else if (grade < 93) {
        letter = '-A'
    } else {
        letter = 'A'
    }
    return letter
}

router.post('/getDiplom', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    try {
        jwt.verify(body.token, key)
        var sql = `select st.*, (select avg(grade) from student_grade where student_code = st.code) as grade_avg from student as st where (select if(count(s.subject_code) > count((select grade from student_grade as sg where sg.subject_code = s.subject_code and st.code = sg.student_code limit 1)), false, true) from schedule_ as s);`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {

                res.json({
                    success: true,
                    result: result,
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getByTeacher', (req, res) => {
    console.log('hi')
    var body = req.body
    console.log('teacher', body)
    try {
        jwt.verify(body.token, key)
        var sql = `select s.*, (select sg.grade from student_grade as sg where sg.student_code = s.code and sg.teacher_code = '${body.teacher_code}'  limit 1) as grade from student as s order by id desc;`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {

                res.json({
                    success: true,
                    result: result,
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getById', (req, res) => {
    var body = req.body
    console.log(body)
    try {
        jwt.verify(body.token, key)
        var sql = `select *, (select name from teacher_type where id = type_id) as type_name, 
        (select name from degree where id = degree_id) as degree_name, 
        (select name from position_ where id = position_id) as position_name 
        from teacher where id = ${ss.escape(body.id)} order by id desc`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
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
                var obj = {
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
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/add', (req, res) => {
    var body = req.body
    console.log(body)
    try {
        var sql = `insert into student(state_id, country_id,rg_mn,rg_en, famname_mn, famname_en, lname_mn, lname_en, fname_mn, fname_en, gender, work, position, edu, email, phone, work_phone, home_phone, address, facebook)
        values(${ss.escape(body.data[0].id)}, ${ss.escape(body.data[1].id)}, ${ss.escape(body.data[2].value)}, ${ss.escape(body.data[3].value)}, ${ss.escape(body.data[4].value)}, ${ss.escape(body.data[5].value)}, ${ss.escape(body.data[6].value)}, ${ss.escape(body.data[7].value)}, ${ss.escape(body.data[8].value)}, ${ss.escape(body.data[9].value)}, ${ss.escape(body.data[10].id)}, ${ss.escape(body.data[14].value)}, ${ss.escape(body.data[15].value)}, ${ss.escape(body.data[16].default)}, ${ss.escape(body.data[17].value)}, ${ss.escape(body.data[18].value)}, ${ss.escape(body.data[19].value)}, ${ss.escape(body.data[20].value)}, ${ss.escape(body.data[21].value)}, ${ss.escape(body.data[22].value)});`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                res.json({
                    success: true,
                    msg: "Амжилттай",
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/edit', (req, res) => {
    var body = req.body
    console.log(body)
    try {
        var sql = `update teacher set code = ${ss.escape(body.data[0].value)}, position_id = ${ss.escape(body.data[1].id)}, lname_mn = ${ss.escape(body.data[2].value)}, lname_en = ${ss.escape(body.data[3].value)}, fname_mn = ${ss.escape(body.data[4].value)}, fname_en = ${ss.escape(body.data[5].value)}, phone = ${ss.escape(body.data[6].value)}, degree_id = ${ss.escape(body.data[7].id)}, type_id = ${ss.escape(body.data[8].id)} where id = ${ss.escape(body.id)};`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                res.json({
                    success: true,
                    msg: "Амжилттай засварллаа",
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/delete', (req, res) => {
    var body = req.body
    console.log(body)
    try {
        var sql = `delete from teacher where id = ${ss.escape(body.id)}`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                res.json({
                    success: true,
                    msg: "Амжилттай устаглаа",
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getPie', (req, res) => {
    var prof = [
        'BM',
        'HR',
        'CM'
    ]
    var degree = [1, 2, 3]
    var data = [0, 0, 0]
    rs = {}
    try {
        var sql = `select count(id) as count, substring(code, 1, 2) as prof from student group by substring(code, 1, 2);`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                result.forEach(element => {
                    prof.forEach((e, i) => {
                        if (e == element.prof) {
                            data[i] = element.count
                        }
                    });
                });
                rs.sprofgraph = data
                data = [0, 0, 0]
                var sql = `select count(id) as count, degree_id from teacher group by degree_id order by degree_id;`;
                console.log("query: " + sql)
                con.query(sql, (err, result, fields) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "parameter invalid"
                        })
                    } else {
                        result.forEach(element => {
                            degree.forEach((e, i) => {
                                if (e == element.degree_id) {
                                    data[i] = element.count
                                }
                            });
                        });
                        rs.tdegreegraph = data
                        data = [0, 0, 0]
                        res.json({
                            success: true,
                            result: rs,
                        })
                    }
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/getData', (req, res) => {
    months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    rs = {}
    try {
        var sql = `SELECT count(id) as count, DATE_FORMAT(created_at, '%m') as month_
        FROM student group by DATE_FORMAT(created_at, '%m');`;
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                result.forEach(element => {
                    months.forEach((e, i) => {
                        if (e == element.month_) {
                            data[i] = element.count
                        }
                    });
                });
                rs.studentgraph = data
                data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                var sql = `SELECT count(id) as count, DATE_FORMAT(created_at, '%m') as month_
                FROM teacher where type_id = 1 group by DATE_FORMAT(created_at, '%m');`;
                console.log("query: " + sql)
                con.query(sql, (err, result, fields) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "parameter invalid"
                        })
                    } else {
                        result.forEach(element => {
                            months.forEach((e, i) => {
                                if (e == element.month_) {
                                    data[i] = element.count
                                }
                            });
                        });
                        rs.teachergraph = data
                        data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        var sql = `SELECT count(id) as count, DATE_FORMAT(created_at, '%m') as month_
                        FROM teacher where type_id = 2 group by DATE_FORMAT(created_at, '%m');`;
                        console.log("query: " + sql)
                        con.query(sql, (err, result, fields) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    msg: "parameter invalid"
                                })
                            } else {
                                result.forEach(element => {
                                    months.forEach((e, i) => {
                                        if (e == element.month_) {
                                            data[i] = element.count
                                        }
                                    });
                                });
                                rs.teacher_ptgraph = data
                                data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                res.json({
                                    success: true,
                                    result: rs,
                                })
                            }
                        })
                    }
                })
            }
        })
    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

router.post('/addArr', (req, res) => {
    var body = req.body
    console.log(body)
    try {
        var sql = `insert into student(code,rg_mn, famname_mn, famname_en, lname_mn, lname_en, fname_mn, fname_en, gender, email, phone) values`;
        body.data.forEach((e, i) => {
            if (i > 0) sql += ',';
            sql += `(${ss.escape(e.code)}, ${ss.escape(e.register)}, ${ss.escape(e.famname_mn)}, ${ss.escape(e.famname_en)}, ${ss.escape(e.lname_mn)}, ${ss.escape(e.lname_en)}, ${ss.escape(e.fname_mn)}, ${ss.escape(e.fname_en)}, ${ss.escape(e.gender)}, ${ss.escape(e.email)}, ${ss.escape(e.phone)})`;


        });
        console.log("query: " + sql)
        con.query(sql, (err, result, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "parameter invalid"
                })
            } else {
                res.json({
                    success: true,
                    msg: "Амжилттай",
                })
            }
        })

    } catch {
        res.json({
            success: false,
            msg: "parameter invalid"
        })
    }
})

module.exports = router