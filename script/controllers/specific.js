const express = require('express');
const router = express.Router();
const moment = require("moment");
const axios = require("axios");
const {checkRoll, checkSem, checkSub, checkWeek} = require('./middleware');
const {romanToDigits} = require("./utility");

router.get('/specific', (req, res) => {
    res.render('specific', {
        year: moment().format('YYYY'),
    });
});

router.post('/specific', checkRoll, checkSem, checkSub, checkWeek, async (req, res) => {
    const {roll, sem, sub, week} = req.body;
    const semDigits = romanToDigits(sem.split(' ')[0]);
    const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;

    try {
        const response = await axios.head(fileUrl);
        res.json({
            status: response.status,
            url: `/pdf/${roll}_${sem}_${sub}_${week}`,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: error.response.status,
            url: '',
        });
    }
});

module.exports = router;
