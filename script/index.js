const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const app = express();
const worksheetRoute = require('./controllers/worksheet');
const specificRoute = require('./controllers/specific');
const bulkRoute = require('./controllers/bulk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home', {
        year: moment().format('YYYY')
    });
});

app.use('/', worksheetRoute);
app.use('/', specificRoute);
app.use('/', bulkRoute);

module.exports = {
    app
}

