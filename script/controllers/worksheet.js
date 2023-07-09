const express = require('express');
const router = express.Router();
const axios = require('axios');
const { checkRoll, checkSem } = require('./middleware');
const codes = require('../assests/json/codes.json');
const { worksheetRequests } = require('./deta');

router.post('/semester', checkRoll, (req, res) => {
    const { roll } = req.body;
    res.json(Object.keys(codes[roll.slice(6, 8)]));
});

router.post('/subject', checkRoll, checkSem, (req, res) => {
    const { roll, sem } = req.body;
    const { Practical } = codes[roll.slice(6, 8)][sem];
    const sub = {
        code: Object.keys(Practical),
        name: Object.values(Practical),
    };
    res.json(sub);
});

router.get('/pdf/:filename', async (req, res) => {
    const { filename } = req.params;
    const [roll, sem, sub, week] = filename.split('_');

    const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${sem}/${sub}/${roll}_week${week}.pdf`;
    const pdfFileName = `${new Date().getTime()}.pdf`;

    await worksheetRequests.put({
        roll,
        semester: sem,
        subject: sub,
        week,
        platform: req.headers['sec-ch-ua-platform'],
        browser: req.headers['user-agent'],
        ip: req.headers['x-real-ip'],
        date: new Date().toISOString().slice(0, 19).split('T')[0],
        time: new Date().toISOString().slice(0, 19).split('T')[1],
    }, `${new Date().getTime()}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
    try {
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        console.error('Error streaming the PDF:', error);
        res.status(500).send('Error streaming the PDF');
    }
});

module.exports = router;
