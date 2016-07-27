var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
	res.send('Hello world!');
});

app.listen(app.get('port'), function() {
	console.log('listening on ' + app.get('port'));
});