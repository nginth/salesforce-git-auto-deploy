'use strict';
var crypto = require('crypto');

module.exports.validateSignature = function(signature, rawBody) {
    let secret = process.env.GHWH_SECRET;
    let envSignature = crypto
        .createHmac('sha1', new Buffer(secret))
        .update(rawBody)
        .digest('hex');
    return 'sha1=' + envSignature === signature || process.env.IGNORE_SECRET;
}