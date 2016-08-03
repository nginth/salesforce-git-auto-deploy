var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var salesforce = require('./src/salesforce.js');

var config = require('yamljs').load('./config.yml');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(function(req, res, next){
    req.rawBody = '';
    req.on('data', function(buf){
        req.rawBody += buf;
    });
    next();
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/git-push-hook', function(req, res) {
    salesforce.upload();
    var badRequest = false;
    var reqSignature = req.headers['x-hub-signature'];
    if (reqSignature) {
        var envSignature = crypto
                            .createHmac('sha1', new Buffer(config.ghsecret))
                            .update(req.rawBody)
                            .digest('hex');
        if ('sha1=' + envSignature === reqSignature) {
            var commits = res.commits;
            for (var i = 0; i < commits.length; i++) {
                console.log(commits.added);
            }
            res.send('heres your body back:\n' + JSON.stringify(req.rawBody));
        }
        else badRequest = true;    
    }
    else badRequest = true;
    
    if (badRequest) {
        res.status('400').send('Bad Request');
    }
});

app.listen(app.get('port'), function() {
	console.log('listening on ' + app.get('port'));
});