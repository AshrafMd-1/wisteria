const codes = require('../assests/json/codes.json')

const checkRoll = (req, res, next) => {
    const {roll} = req.body;
    if (roll.length !== 10 || isNaN(roll.slice(6, 8)) || !Object.keys(codes).includes(roll.slice(6, 8))) {
        res.send('Invalid Roll Number');
    } else {
        next();
    }
};

const checkFrom = (req, res, next) => {
    const {from} = req.body;
    if (from.length !== 10 || isNaN(from.slice(6, 8)) || !Object.keys(codes).includes(from.slice(6, 8))) {
        res.send('Invalid Roll Number');
    } else {
        next();
    }
};

const checkTo = (req, res, next) => {
    const {to} = req.body;
    if (to.length !== 10 || isNaN(to.slice(6, 8)) || !Object.keys(codes).includes(to.slice(6, 8))) {
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

module.exports = {
    checkRoll,
    checkFrom,
    checkTo,
    checkSem,
    checkSub,
    checkWeek
}