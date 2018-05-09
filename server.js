require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');

var appRoutes = require('./routes/app');

var app = express();
var logDirectory = path.join(__dirname, 'log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily 
    path: logDirectory
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (process.env.environment == 'development')
    app.use(morgan('dev'));
else
    app.use(morgan('combined', {stream: accessLogStream}));

app.use(function(req, res, next) {
    let origin = null;
    let reqOrigin = req.headers.origin;
    let allowedOrigins = process.env.ORIGIN.split(' ');

    if (process.env.environment === 'development') {
        origin = '*';
    } else {
        if (allowedOrigins.length > 0) {
            if (allowedOrigins.indexOf(reqOrigin) > -1) {
                origin = reqOrigin
            }
        }
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/', appRoutes);

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('Server started at http://localhost:' + port);
});