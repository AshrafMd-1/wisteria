const express = require('express');
const moment = require("moment");
const router = express.Router();

const {checkRoll, checkSem, checkSub, checkWeek} = require('./middleware');
const {romanToDigits} = require("./utility");
const path = require("path");
const fs = require("fs");
const https = require("https");

router.get('/specific', (req, res) => {
    res.render('specific', {
        year: moment().format('YYYY'),
    });
});

router.post('/specific', checkRoll, checkSem, checkSub, checkWeek, async (req, res) => {
    try {
        const {roll, sem, sub, week} = req.body;
        const semDigits = romanToDigits(sem.split(' ')[0]);
        const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;

        const downloadPath = path.resolve(__dirname, '..', 'assests', 'pdf', `${roll}_${week}_${new Date().getTime()}.pdf`);
        const fileStream = fs.createWriteStream(downloadPath);

        await new Promise((resolve, reject) => {
            https.get(fileUrl, (response) => {
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close(() => {
                        res.json({
                            status: response.statusCode, url: `/pdf/${path.basename(downloadPath)}`
                        }); // Send the download URL to the user
                        resolve();
                    });
                });
            }).on('error', (err) => {
                console.error(err);
                reject(err);
            });
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: error.response.status
        });
    }
});

module.exports = router;