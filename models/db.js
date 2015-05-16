var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;
var db_url = 'mongodb://' + settings.host + ':27017/' + settings.db;

exports.connect = function (callback) {
    MongoClient.connect(db_url, callback);
};