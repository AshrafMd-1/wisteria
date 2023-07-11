const express = require('express');
const router = express.Router();
const moment = require("moment");
const axios = require("axios");
const {checkIP, checkRoll, checkSem, checkSub, checkWeek} = require('./middleware');
const {romanToDigits} = require("./utility");
const {specificSearch} = require('./deta');

router.get('/specific', (req, res) => {
    res.render('specific', {
        year: moment().format('YYYY'),
    });
});

router.post('/specific', checkRoll, checkSem, checkSub, checkWeek, checkIP, async (req, res) => {
    let {roll, sem, sub, week, ip} = req.body;
    week = Number(week).toString()
    const semDigits = romanToDigits(sem.split(' ')[0]);
    const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;

    try {
        const response = await axios.head(fileUrl)

        await specificSearch.put({
            roll,
            semester: semDigits,
            subject: sub,
            week,
            search: true,
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['user-agent'],
            ip: ip,
            date: new Date().toISOString().slice(0, 19).split('T')[0],
            time: new Date().toISOString().slice(0, 19).split('T')[1],
        }, `${new Date().getTime()}`);

        res.json({
            status: response.status,
            url: `/pdf/${roll}_${semDigits}_${sub}_${week}`,
        });
    } catch (error) {
        console.error('Error requesting the PDF');
        await specificSearch.put({
            roll,
            semester: semDigits,
            subject: sub,
            week,
            search: false,
            ip: ip,
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['user-agent'],
            date: new Date().toISOString().slice(0, 19).split('T')[0],
            time: new Date().toISOString().slice(0, 19).split('T')[1],
        }, `${new Date().getTime()}`);
        res.json({
            status: error.response.status,
            url: '',
        });
    }
});

module.exports = router;
