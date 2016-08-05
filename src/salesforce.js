var jsforce = require('jsforce');
var config = require('yamljs').load('./config.yml');
var SalesforceManager = function() {};

SalesforceManager.prototype.upload = function(options, callback) {
    var conn = new jsforce.Connection({
        loginUrl: config.loginUrl
    });
    conn.login(config.username, config.password, function(err, data) {
        if (err) return console.log(err);
        //console.log(data.url);
    });
    
}

module.exports = new SalesforceManager();