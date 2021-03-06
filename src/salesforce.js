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

SalesforceDeployer.prototype.deploy = function (ghData, callback) {
    let filenames = parseRequest(ghData.commits);
    console.log('filenames: ' + JSON.stringify(filenames));
    createZip(filenames, ghData.repository, function (err, res) {
        if (err) return console.log(err);
        deployToSalesforce(callback);
    });
}

function createZip(filenames, repo, callback) {
    let contents = [];
    let toDeploy = filenames.added.concat(filenames.modified);
    Promise.map(toDeploy, function (filename) {
        return github.repos.getContent({
                user: repo.owner.name,
                repo: repo.name,
                path: filename
            });
    }).each(function (res) {
        var unencodedData = new Buffer(res.content, 'base64').toString('utf8');
        contents.push({name: res.name, data: unencodedData});
    }).then(function () {
        let zip = new JSZip();
        let zipUnpack = zip.folder('unpackaged');
        contents.forEach(function (file) {
            zipUnpack
            .folder('classes')
            .file(file.name, file.data)
            .file(file.name + '-meta.xml', createMetadataXml(file));
        });
        zipUnpack.file('package.xml', createPackageXml());
        if(filenames.removed) {
            zipUnpack.file('destructiveChangesPost.xml', createDestructiveChangesXml(filenames.removed));
        }
        zip
        .generateNodeStream({type: 'nodebuffer'})
        .pipe(fs.createWriteStream('deploy.zip', {defaultEncoding: 'binary'}))
        .on('finish', function () {
            callback();
        });
    });
}

function deployToSalesforce(callback) {
    let conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGINURL
    });
    const username = process.env.SALESFORCE_USER;
    const password = process.env.SALESFORCE_PASS;
    let zipStream = fs.createReadStream('deploy.zip');
    conn
    .login(username, password)
    .then(function (data) {
        let deploy = conn.metadata
        .deploy(zipStream)
        .complete()
        .then(function (result) {
            console.log('Deploy finished: ' + result.done);
            console.log('Components deployed: ' + result.numberComponentsDeployed);
            console.log('Components errors: ' + result.numberComponentErrors);
            console.log('Total components: ' + result.numberComponentsTotal);
            callback(null, result);
        })
        .catch(err => callback(err));
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
    return new Buffer(xmlString).toString();
}

function createDestructiveChangesXml(filenames) {
    let toRemove = [];
    filenames.forEach(filename => {
        let split = filename.split('/');
        let classNameWithExtension = split[split.length - 1];
        let className = classNameWithExtension.split('.')[0];
        toRemove.push(className);
    }); 
    let xmlObject = {
        Package: [
            {_attr:
                {xmlns: 'http://soap.sforce.com/2006/04/metadata'}
            },
            {types:
                [
                    {members: toRemove},
                    {name: 'ApexClass'}
                ]
            }
        ]
    }
    let xmlString = xml(xmlObject, {declaration: true, indent: true});
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
        filenames.modified = filenames.modified.concat(commits[i].modified);
        filenames.removed = filenames.removed.concat(commits[i].removed);
    }
    return filenames;
}

module.exports = new SalesforceDeployer();