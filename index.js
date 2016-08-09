'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var salesforce = require('./src/salesforce.js');

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

app.post('/git-push-hook', function (req, res) {
    let badRequest = false;
    let reqSignature = req.headers['x-hub-signature'];
    if (reqSignature) {
        let secret = process.env.GHWH_SECRET;
        let envSignature = crypto
            .createHmac('sha1', new Buffer(secret))
            .update(req.rawBody)
            .digest('hex');
        if ('sha1=' + envSignature === reqSignature || process.env.IGNORE_SECRET) {
            salesforce.deploy(req.body, function(err, result) {
                if (err) return res.status('500').send(err);
                res.send(result);
            });
        } else {
            res.status('403').send('Unauthorized');
        }
    } else {
        res.status('400').send('Bad Request');
    }
});

app.listen(app.get('port'), function () {
    console.log('listening on ' + app.get('port'));
});