const codes = require('../assests/json/codes.json');

const checkRoll = (req, res, next) => {
    const {roll} = req.body;
    if (roll.length !== 10 || isNaN(roll.slice(6, 8)) || !(roll.slice(6, 8) in codes)) {
        res.send('Invalid Roll Number');
    } else {
        next();
    }
};

const checkFrom = (req, res, next) => {
    const {from} = req.body;
    if (from.length !== 10 || isNaN(from.slice(6, 8)) || !(from.slice(6, 8) in codes)) {
        res.send('Invalid Roll Number');
    } else {
        next();
    }
};

const checkTo = (req, res, next) => {
    const {to} = req.body;
    if (to.length !== 10 || isNaN(to.slice(6, 8)) || !(to.slice(6, 8) in codes)) {
        res.send('Invalid Roll Number');
    } else {
        next();
    }
};

const checkSem = (req, res, next) => {
    let {sem, roll} = req.body;
    if (!roll) {
        roll = req.body.from;
    }
    if (codes[roll.slice(6, 8)][sem]) {
        next();
    } else {
        res.send('Invalid Semester');
    }
};

const checkSub = (req, res, next) => {
    let {sub, sem, roll} = req.body;
    if (!roll) {
        roll = req.body.from;
    }
    if (codes[roll.slice(6, 8)][sem]['Practical'][sub]) {
        next();
    } else {
        res.send('Invalid Subject');
    }
};

const checkWeek = (req, res, next) => {
    const {week} = req.body;
    if (week > 0 && week < 15) {
        next();
    } else {
        res.send('Invalid Week');
    }
};
const checkIP = (req, res, next) => {
    const {ip} = req.body;
    if (ip===''||!ip||ip.split('.').length!==4) {
        res.send('Invalid IP Address!');
    } else {
        next();
    }
};

module.exports = {
    checkRoll,
    checkFrom,
    checkTo,
    checkSem,
    checkSub,
    checkWeek,
    checkIP,
};
