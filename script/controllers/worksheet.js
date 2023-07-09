const express = require('express');
const router = express.Router();
const axios = require('axios');
const {checkRoll, checkSem} = require('./middleware');
const codes = require('../assests/json/codes.json');
const {romanToDigits} = require("./utility");

router.post('/semester', checkRoll, (req, res) => {
    const {roll} = req.body;
    res.json(Object.keys(codes[roll.slice(6, 8)]));
});

router.post('/subject', checkRoll, checkSem, (req, res) => {
    const {roll, sem} = req.body;
    const {Practical} = codes[roll.slice(6, 8)][sem];
    const sub = {
        code: Object.keys(Practical),
        name: Object.values(Practical),
    };
    res.json(sub);
});

router.get('/pdf/:filename', async (req, res) => {
    const {filename} = req.params;
    const [roll, sem, sub, week] = filename.split('_');
    const semDigits = romanToDigits(sem.split(' ')[0]);

    const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;
    const pdfFileName = `${new Date().getTime()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
    try {
        const response = await axios.get(fileUrl, {responseType: 'stream'});
        response.data.pipe(res);
    } catch (error) {
        console.error('Error streaming the PDF:', error);
        res.status(500).send('Error streaming the PDF');
    }
});

module.exports = router;
