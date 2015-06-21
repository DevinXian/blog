var mongodb = require('./db');

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1 ),
        day: date.getFullYear() + '-' + (date.getMonth() + 1 ) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1 ) + '-' + date.getDate() + ' '
        + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        time: time
    };
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.insert(post, {safe: true}, function (err) {
                db.close();
                callback(err);
            });
        });
    });
};

Post.get = function (name, callback) {
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                if (err) {
                    db.close();
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};