var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));

//middlewares
app.use(bodyParser.json(););

app.get('/', function(req, res) {
	res.send('Hello world!');
});

app.post('/git-push-hook', function(req, res) {
	res.send('heres your body back:\nreq.body');
});

app.listen(app.get('port'), function() {
	console.log('listening on ' + app.get('port'));
});