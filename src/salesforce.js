var jsforce = require('jsforce');

var SalesforceManager = function() {};

SalesforceManager.prototype.upload = function(options, callback) {
    var conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGINURL
    });
    var username = process.env.SALESFORCE_USER;
    var password = process.env.SALESFORCE_PASS;
    conn.login(username, password, function(err, data) {
        if (err) return console.log(err);
        //console.log(data.url);
    });
}

module.exports = new SalesforceManager();