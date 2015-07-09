var mongodb = require('./db');
var markdown = require('markdown').markdown;

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
        time: time,
        comments: []
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

Post.getAll = function (name, callback) {
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
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
};

Post.getOne = function (name, day, title, callback) {
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.findOne({
                'name': name,
                'time.day': day,
                'title': title
            }, function (err, doc) {
                if (err) {
                    db.close();
                    return callback(err);
                }
                if (doc) {
                    doc.post = markdown.toHTML(doc.post);
                    (doc.comments || []).forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }
                callback(null, doc);
            });
        });
    });
};

//编辑
Post.edit = function (name, day, title, callback) {
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.findOne({
                'name': name,
                'time.day': day,
                'title': title
            }, function (err, doc) {
                if (err) {
                    db.close();
                    return callback(err);
                }
                callback(null, doc);//markdown raw模式
            });
        });
    });
};

//更新
Post.update = function (name, day, title, post, callback) {
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.update({
                'name': name,
                'time.day': day,
                'title': title
            }, {$set: {post: post}}, function (err) {
                if (err) {
                    db.close();
                }
                callback(err);
            });
        });
    });
};

//删除
Post.remove = function (name, day, title, callback) {
    mongodb.connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.remove({
                'name': name,
                'time.day': day,
                'title': title
            }, {
                w: 1
            }, function (err) {
                if (err) {
                    db.close();
                }
                callback(err);
            });
        });
    });
};