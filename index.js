'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var salesforce = require('./src/salesforce.js');
var auth = require('./src/auth.js');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(function (req, ignore, next) {
    req.rawBody = '';
    req.on('data', function (buf) {
        req.rawBody += buf;
    });
    next();
});

app.use(bodyParser.json());

app.get('/', function (ignore, res) {
    res.render('index');
});

app.post(process.env.GHWH_ENDPOINT, function (req, res) {
    let reqSignature = req.headers['x-hub-signature'];
    if (!reqSignature) {
        return res.status('400').send('Bad Request');
    }

    if (auth.validateSignature(reqSignature, req.rawBody)) {
        salesforce.deploy(req.body, function (err, result) {
            if (err) { 
                console.log(err);
                return res.status('500').send(err);
            }
            if (process.env.GHWH_CALLBACK) {
                let formData = (err || res);
                request.post({url: process.env.GHWH_CALLBACK, formData: formData}, (err, res) => console.log(err));
            }
        });
    } else {
        res.status('403').send('Unauthorized');
    }
});

app.listen(app.get('port'), function () {
    console.log('listening on ' + app.get('port'));
});