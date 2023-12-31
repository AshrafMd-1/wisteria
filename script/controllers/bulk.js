const express = require('express');
const moment = require('moment');
const router = express.Router();
const {romanToDigits, rollChecker} = require('./utility');
const axios = require('axios');
const {checkIP, checkFrom, checkTo, checkSem, checkSub, checkWeek} = require('./middleware');
const {bulkSearch} = require('./deta');

router.get('/bulk', (req, res) => {
    res.render('bulk', {
        year: moment().format('YYYY'),
    });
});

router.post('/bulk', checkFrom, checkTo, checkSem, checkSub, checkWeek, checkIP, async (req, res) => {
    try {
        let {from, to, sem, sub, week, ip} = req.body;
        week = Number(week).toString()
        const semDigits = romanToDigits(sem.split(' ')[0]);
        const rolls = rollChecker(from, to);
        const status = [];

        for (const roll of rolls) {
            const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;
            const response = await axios.head(fileUrl).catch(() => null);
            status.push({
                roll,
                status: response ? 'Uploaded' : 'Not Uploaded',
                url: response ? `/pdf/${roll}_${semDigits}_${sub}_${week}` : null,
            });
        }

        const filteredStatus = status.filter((item) => item !== null);

        await bulkSearch.put({
            from,
            to,
            semester: semDigits,
            subject: sub,
            week,
            rolls: rolls.length,
            uploads: filteredStatus.filter((item) => item.status === 'Uploaded').length,
            ip: ip,
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['user-agent'],
            date: new Date().toISOString().slice(0, 19).split('T')[0],
            time: new Date().toISOString().slice(0, 19).split('T')[1],
        }, `${new Date().getTime()}`);

        res.header('Content-Type', 'application/json');
        res.json({
            status: 200,
            data: filteredStatus,
        });
    } catch (error) {
        console.error(error);
        res.json({status: error.response ? error.response.status : 500});
    }
});

module.exports = router;
