var DB = require('./db');

DB.connect(function(err, dat){
    var collection = dat.collection('user');
    collection.insertOne({name:1}, function(err, result){
        console.log(arguments)
    });
});