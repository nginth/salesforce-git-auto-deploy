var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/git-push-hook', function(req, res) {
	var badRequest = false;
    var reqSignature = req.headers['x-hub-signature'];
    if (hash) {
        var envSignature = crypto
                            .createHmac('sha1', process.env.GHWH_SECRET)
                            .update(req.rawBody)
                            .digest('hex');
        if ('sha1=' + envSignature === reqSignature) {
            res.send('heres your body back:\n' + JSON.stringify(req.body));
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