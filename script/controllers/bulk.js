const express = require('express');
const moment = require('moment');
const router = express.Router();
const { romanToDigits, rollChecker } = require('./utility');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { checkFrom, checkTo, checkSem, checkSub, checkWeek } = require('./middleware');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);

const PDF_DOWNLOADS_DIR = path.resolve(__dirname, '..', 'assets', 'pdf');
const MAX_PDF_FILES = 30;

function createFolderIfNotExists(folderPath, callback) {
    fs.access(folderPath, fs.constants.F_OK, (err) => {
        if (err) {
            // Folder doesn't exist, create it
            fs.mkdir(folderPath, { recursive: true }, (mkdirErr) => {
                if (mkdirErr) {
                    callback(mkdirErr);
                } else {
                    callback(null, folderPath);
                }
            });
        } else {
            // Folder already exists
            callback(null, folderPath);
        }
    });
}


async function deleteFile(filePath, req) {
    try {
        await unlinkAsync(filePath);
        console.log(`${path.basename(filePath)} deleted at ${new Date().toLocaleString()}! at IP ${req.ip}`);
    } catch (err) {
        console.error(`Error deleting ${path.basename(filePath)}:`, err);
    }
}

async function getFile(fileUrl, downloadPath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(downloadPath);
        https.get(fileUrl, (response) => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close(() => {
                    resolve();
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

router.get('/bulk', (req, res) => {
    res.render('bulk', {
        year: moment().format('YYYY'),
    });
});

router.post('/bulk', checkFrom, checkTo, checkSem, checkSub, checkWeek, async (req, res) => {
    try {
        const { from, to, sem, sub, week } = req.body;
        const semDigits = romanToDigits(sem.split(' ')[0]);
        const rolls = rollChecker(from.toUpperCase(), to.toUpperCase());
        const status = [];
        for (const roll of rolls) {
            const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${semDigits}/${sub}/${roll}_week${week}.pdf`;
            const response = await axios.get(fileUrl).catch(() => null);
            status.push({
                roll,
                status: response ? 'Uploaded' : 'Not Uploaded',
                url: response ? `/bulk/pdf/${roll}_${semDigits}_${sub}_${week}.pdf` : null,
            });
        }

        const filteredStatus = status.filter((item) => item !== null);
        res.header('Content-Type', 'application/json');

        res.json({
            status: 200,
            data: filteredStatus,
        });
    } catch (error) {
        console.error(error);
        res.json({ status: error.response ? error.response.status : 500 });
    }
});

router.get('/bulk/pdf/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        let [roll, sem, sub, week] = filename.split('_');
        week = week[0]
        const fileUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/LAB/SEM${sem}/${sub}/${roll}_week${week}.pdf`;

        createFolderIfNotExists(PDF_DOWNLOADS_DIR, (err, createdFolderPath) => {
            if (err) {
                console.error('Error creating folder:', err);
            } else {
                console.log('Folder created or already exists:', createdFolderPath);
            }
        });

        const downloadPath = path.resolve(PDF_DOWNLOADS_DIR, `${roll}_${week}_${new Date().getTime()}.pdf`);

        await getFile(fileUrl, downloadPath);
        const fileStreams = fs.createReadStream(downloadPath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${filename}`);
        fileStreams.on('end', async () => {
            await deleteFile(downloadPath, req);
        });

        fileStreams.pipe(res);

        const pdfFiles = await readdirAsync(PDF_DOWNLOADS_DIR);
        if (pdfFiles.length > MAX_PDF_FILES) {
            const filesToDelete = pdfFiles.slice(0, pdfFiles.length - MAX_PDF_FILES);
            for (const file of filesToDelete) {
                await deleteFile(path.join(PDF_DOWNLOADS_DIR, file));
            }
        }
    } catch (error) {
        console.error(error);
        res.json({ status: error.response ? error.response.status : 500 });
    }
});

module.exports = router;
