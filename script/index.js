const express = require('express');
const app = express();

const moment = require('moment');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, 'public')));

const worksheetRoute = require('./controllers/worksheet');
const specificRoute = require('./controllers/specific');
const bulkRoute = require('./controllers/bulk');
const statusRoute = require('./controllers/status');

//Home Page
app.get('/', (req, res) => {
    res.render('home', {
        year: moment().format('YYYY')
    });
});

//Routes
app.use('/', worksheetRoute);
app.use('/', specificRoute);
app.use('/', bulkRoute);
app.use('/', statusRoute);

//Start Server
app.listen(port, () => {
    if (port === 8080) console.log(`App listening on port ${port}!`);
});
