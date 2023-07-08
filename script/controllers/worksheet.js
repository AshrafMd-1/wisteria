const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {checkRoll, checkSem} = require('./middleware');
const {promisify} = require('util');

const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);

const codes = require('../assests/json/codes.json')

const PDF_DOWNLOADS_DIR = path.resolve(__dirname, '..', 'assests', 'pdf');
const MAX_PDF_FILES = 30;

async function deleteFile(filePath, req) {
    try {
        await unlinkAsync(filePath);
        console.log(`${path.basename(filePath)} deleted at ${new Date().toLocaleString()}! at IP ${req.ip}`);
    } catch (err) {
        console.error(`Error deleting ${path.basename(filePath)}:`, err);
    }
}

router.post('/semester', checkRoll, (req, res) => {
    const {roll} = req.body;
    res.json(Object.keys(codes[roll.slice(6, 8)]));
});

router.post('/subject', checkRoll, checkSem, (req, res) => {
    const {roll, sem} = req.body;
    const sub = {
        code: Object.keys(codes[roll.slice(6, 8)][sem]['Practical']),
        name: Object.values(codes[roll.slice(6, 8)][sem]['Practical']),
    };
    res.json(sub);
});

router.get('/pdf/:filename', async (req, res) => {
    const {filename} = req.params;
    const filePath = path.join(PDF_DOWNLOADS_DIR, filename);

    // Step 1: Set the appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${filename}`);

    // Step 2: Stream the PDF file to the response
    const fileStream = fs.createReadStream(filePath);

    // Step 3: Handle the end event of the file stream
    fileStream.on('end', async () => {
        // Step 4: Delete the PDF file after streaming is complete
        await deleteFile(filePath, req);
    });

    // Step 5: Stream the file to the response
    fileStream.pipe(res);

    const pdfFiles = await readdirAsync(PDF_DOWNLOADS_DIR);
    if (pdfFiles.length > MAX_PDF_FILES) {
        const filesToDelete = pdfFiles.slice(0, pdfFiles.length - MAX_PDF_FILES);
        for (const file of filesToDelete) {
            await deleteFile(path.join(PDF_DOWNLOADS_DIR, file));
        }
    }
});

module.exports = router;
