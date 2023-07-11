const express = require('express');
const router = express.Router();
const axios = require('axios');
const {checkRoll, checkSem} = require('./middleware');
const codes = require('../assests/json/codes.json');
const {worksheetRequests} = require('./deta');

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
    let [roll, sem, sub, week] = filename.split('_');
    if (!roll || !(roll.length === 10) || !sem || isNaN(sem) || !sub || !week || isNaN(week)) return res.status(400).send('Invalid Request');
    week = Number(week).toString()

    const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${sem}/${sub}/${roll}_week${week}.pdf`;
    const pdfFileName = `${new Date().getTime()}.pdf`;

    try {
        const response = await axios.get(fileUrl, {responseType: 'stream'});
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
        response.data.pipe(res);
        await worksheetRequests.put({
            roll,
            semester: sem,
            subject: sub,
            week,
            error: false,
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['user-agent'],
            date: new Date().toISOString().slice(0, 19).split('T')[0],
            time: new Date().toISOString().slice(0, 19).split('T')[1],
        }, `${new Date().getTime()}`);
    } catch (error) {
        console.error('Error streaming the PDF or PDF not found');
        res.setHeader('Content-Type', 'application/json');
        await worksheetRequests.put({
            roll,
            semester: sem,
            subject: sub,
            week,
            error: true,
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['user-agent'],
            date: new Date().toISOString().slice(0, 19).split('T')[0],
            time: new Date().toISOString().slice(0, 19).split('T')[1],
        }, `${new Date().getTime()}`);
        res.status(500).send('Error streaming the PDF or PDF not found');
    }
});

module.exports = router;
