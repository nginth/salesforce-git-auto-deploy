var jsforce = require('jsforce');
var config = require('yamljs').load('./config.yml');
var SalesforceManager = function() {};

SalesforceManager.prototype.upload = function(options, callback) {
    var conn = new jsforce.Connection({
        loginUrl: config.loginUrl
    });
    conn.login(config.username, config.password, function(err, data) {
        if (err) return console.log(err);
        console.log(data.url);
    });

    // do stuff

    conn.logout(function(err) {
       if (err) console.log(err);
    });
}

module.exports = new SalesforceManager();