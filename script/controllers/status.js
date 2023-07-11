const express = require('express');
const router = express.Router();
const {specificSearch, bulkSearch, worksheetRequests} = require('./deta');

router.get(`/data/specific/${process.env.secret_link}`, async (req, res) => {
    const specificData = (await specificSearch.fetch()).items

    res.json({
        "db name": "specificSearch",
        "data": specificData
    })
});

router.get(`/data/bulk/${process.env.secret_link}`, async (req, res) => {
    const bulkData = (await bulkSearch.fetch()).items

    res.json({
        "db name": "bulkSearch",
        "data": bulkData
    })
});

router.get(`/data/worksheet/${process.env.secret_link}`, async (req, res) => {
    const worksheetData = (await worksheetRequests.fetch()).items

    res.json({
        "db name": "worksheetRequests",
        "data": worksheetData
    })
});


module.exports = router;