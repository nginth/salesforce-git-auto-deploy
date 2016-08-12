'use strict';
var jsforce = require('jsforce');
var githubApi = require('github');
var Promise = require('bluebird');
var JSZip = require('jszip');
var fs = Promise.promisifyAll(require('fs'));
var xml = require('xml');
var through = require('through2');

var SalesforceDeployer = function() {};
var github = new githubApi({
    debug: true,
    protocol: 'https',
    Promise: Promise
})

SalesforceDeployer.prototype.deploy = function(ghData, callback) {
    let filenames = parseRequest(ghData.commits);
    console.log('filenames: ' + JSON.stringify(filenames));
    
    let contents = [];
    Promise.map(filenames.added, function(filename) {
        let repo = ghData.repository;        
        return github.repos.getContent({
                user: repo.owner.name,
                repo: repo.name,
                path: filename
            });
    }).each(function(res) {
        var unencodedData = new Buffer(res.content, 'base64').toString('utf8');
        contents.push({name: res.name, data: unencodedData});
    }).then(function() {
        console.log(contents);
        let zip = new JSZip();
        let zipUnpack = zip.folder('unpackaged');
        contents.forEach(function (file) {
            zipUnpack
            .folder('classes')
            .file(file.name, file.data)
            .file(file.name + '-meta.xml', createMetadataXml(file));
        });
        zipUnpack.file('package.xml', createPackageXml());
        zip
        .generateNodeStream({type: 'nodebuffer'})
        .pipe(fs.createWriteStream('deploy.zip', {defaultEncoding: 'binary'}))
        .on('finish', function () {
            deployToSalesforce(callback);
        });
    });
}

function deployToSalesforce(callback) {
    let conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGINURL
    });
    const username = process.env.SALESFORCE_USER;
    const password = process.env.SALESFORCE_PASS;
    const pollInterval = 1000;
    const pollTimeout = 30000;
    let zipStream = fs.createReadStream('deploy.zip');
    conn
    .login(username, password)
    .then(function (data) {
        let deploy = conn.metadata
        .deploy(zipStream)
        .on('progress', result => console.log('Deploying...'))
        .on('complete', function(result) {
            console.log(JSON.stringify(result));
            console.log(result.done);
            console.log('numberComponentsDeployed: ' + result.numberComponentsDeployed);
            callback(null, 'Deploy complete.\nComponents deployed: ' + result.numberComponentsDeployed);
        })
        .on('error', err => callback(err))
        .poll(pollInterval, pollTimeout);
    })
    .catch(err => callback(err));
}

function createPackageXml() {
    let xmlObject = {
        Package: [
            {_attr: 
                {xmlns: 'http://soap.sforce.com/2006/04/metadata'}
            },
            {types: 
                [
                    {members: '*'},
                    {name: 'ApexClass'}
                ]
            },
            {version: '37.0'}
        ]
    }
    let xmlString = xml(xmlObject, {declaration: true, indent: true});
    console.log(xmlString);
    return new Buffer(xmlString).toString();
}

function createMetadataXml() {
    let xmlObject = {
        ApexClass: [
            {_attr:
                {xmlns: 'http://soap.sforce.com/2006/04/metadata'}
            },
            {apiVersion: '37.0'},
            {status: 'Active'}
        ]
    }
    let xmlString = xml(xmlObject, {declaration: true, indent: true});
    console.log(xmlString);
    return new Buffer(xmlString).toString();
}

function parseRequest(commits) {
    let filenames = {
        added: [],
        modified: [],
        removed: []
    }
    let i;
    for (i = 0; i < commits.length; i += 1) {
        filenames.added = filenames.added.concat(commits[i].added);
        filenames.updated = filenames.modified.concat(commits[i].modified);
        filenames.removed = filenames.removed.concat(commits[i].removed);
    }
    return filenames;
}

module.exports = new SalesforceDeployer();