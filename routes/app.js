var express = require('express');
var router = express.Router();
var sql = require('mssql');
var db = require('../db/db');

router.post('/verifylink', function(req, res) {
    db.then(conn => {
        var request = new sql.Request(conn);

        var query = `
                    SELECT ul.personID, i.firstName, ul.watched
                    FROM EPS_UniqueLink ul
                        INNER JOIN Person p ON p.personID = ul.personID
                        INNER JOIN [Identity] i ON i.identityID = p.currentIdentityID
                    WHERE CAST(ul.[key] AS VARCHAR(36)) IN('${req.body.key}')
                        AND ul.[app] IN('ASR')
                        AND ul.accepted = 0
                        AND ul.endYear IN(SELECT endYear FROM SchoolYear WHERE active = 1)`;

        request.query(query)
        .then(result => {
            if (result.recordset.length == 0) {
                res.status(401).json({
                    title: 'Error',
                    success: false,
                    error: 'Sorry, the URL you have entered is invalid or you have already completed the Annual Student Review.',
                    msg: 'Invalid URL'
                });
            } else {
                res.status(200).json({
                    title: 'Success',
                    success: true,
                    data: { first: result.recordset[0].firstName, watched: result.recordset[0].watched }
                });
            }
        }).catch(error => {
            res.status(401).json({
                title: 'Error',
                success: false,
                error: 'Sorry, unable to retrieve data from the database. Try again later.',
                msg: process.env.environment == 'development' ? error : 'Database access error.'
            });
        });
    }).catch(error => {
        res.status(401).json({
            title: 'Error',
            success: false,
            error: 'Sorry, unable to connect to the database. Try again later.',
            msg: process.env.environment == 'development' ? error : 'Database connection error.'
        });
    });
});

router.post('/accept', function(req, res) {
    db.then(conn => {
        var request = new sql.Request(conn);

        request.input('key', sql.VarChar, req.body.key)
        .input('app', sql.VarChar, 'ASR')
        .query('UPDATE EPS_UniqueLink SET accepted = 1, acceptedTimestamp = GETDATE() WHERE CAST([key] AS VARCHAR(36)) IN(@key) AND [app] IN(@app) AND accepted = 0 AND endYear IN(SELECT endYear FROM SchoolYear WHERE active = 1)')
        .then(result => {
            if (result.rowsAffected == 1) {
                res.status(200).json({
                    title: 'Success',
                    success: true
                });
            } else {
                res.status(401).json({
                    title: 'Error',
                    success: false,
                    error: 'Sorry, the URL you have entered is invalid or you have already completed the Annual Student Review.',
                    msg: 'Invalid URL'
                });
            }
        }).catch(error => {
            res.status(401).json({
                title: 'Error',
                success: false,
                error: 'Sorry, unable to retrieve data from the database. Try again later.',
                msg: process.env.environment == 'development' ? error : 'Database access error.'
            });
        });
    }).catch(error => {
        res.status(401).json({
            title: 'Error',
            success: false,
            error: 'Sorry, unable to connect to the database. Try again later.',
            msg: process.env.environment == 'development' ? error : 'Database connection error.'
        });
    });
});

router.post('/watched', function(req, res) {
    db.then(conn => {
        var request = new sql.Request(conn);

        request.input('key', sql.VarChar, req.body.key)
        .input('app', sql.VarChar, 'ASR')
        .query('UPDATE EPS_UniqueLink SET watched = 1 WHERE CAST([key] AS VARCHAR(36)) IN(@key) AND [app] IN(@app) AND accepted = 0 AND endYear IN(SELECT endYear FROM SchoolYear WHERE active = 1)')
        .then(result => {
            if (result.rowsAffected == 1) {
                res.status(200).json({
                    title: 'Success',
                    success: true
                });
            } else {
                res.status(401).json({
                    title: 'Error',
                    success: false,
                    error: 'Sorry, the URL you have entered is invalid or you have already completed the Annual Student Review.',
                    msg: 'Invalid URL'
                });
            }
        }).catch(error => {
            res.status(401).json({
                title: 'Error',
                success: false,
                error: 'Sorry, unable to retrieve data from the database. Try again later.',
                msg: process.env.environment == 'development' ? error : 'Database access error.'
            });
        });
    }).catch(error => {
        res.status(401).json({
            title: 'Error',
            success: false,
            error: 'Sorry, unable to connect to the database. Try again later.',
            msg: process.env.environment == 'development' ? error : 'Database connection error.'
        });
    });
});

router.all('*', function(req, res) {
    res.status(401).json({
        title: 'Invalid Route',
        success: false,
        error: 'Route does not exist.'
    });
});

module.exports = router;