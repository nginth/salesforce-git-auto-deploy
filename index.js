var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/git-push-hook', function(req, res) {
	res.send('heres your body back:\n' + JSON.stringify(req.body));
});

app.listen(app.get('port'), function() {
	console.log('listening on ' + app.get('port'));
});