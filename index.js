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
    var badRequest = false;
    var reqSignature = req.headers['x-hub-signature'];
    if (reqSignature) {
        var secret = process.env.GHWH_SECRET;
        console.log(secret);
        var envSignature = crypto
            .createHmac('sha1', new Buffer(secret))
            .update(req.rawBody)
            .digest('hex');
        if ('sha1=' + envSignature === reqSignature) {
            console.log(req.body);
            var commits = res.body.commits;
            var i;
            console.log('commits added:')
            for (i = 0; i < commits.length; i += 1) {
                console.log(commits[i].added);
            }

            res.send('heres your body back:\n' + JSON.stringify(req.rawBody));
        } else {
            badRequest = true;
        }
    } else {
        badRequest = true;
    }

    if (badRequest) {
        res.status('400').send('Bad Request');
    }
});

app.listen(app.get('port'), function () {
    console.log('listening on ' + app.get('port'));
});