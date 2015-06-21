var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

module.exports = function (app) {
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get('/reg', checkNotLogin, function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/reg', checkNotLogin, function (req, res) {
        var name, password, password_re, md5;

        name = req.body.name;
        password = req.body.password;
        password_re = req.body['password-repeat'];

        if (!name || !password || !password_re) {
            req.flash('error', '用户名和密码不能为空');
            return res.redirect('/reg');
        }
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致');
            return res.redirect('/reg');
        }
        md5 = crypto.createHash('md5');
        password = md5.update(password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });
        User.get(name, function (err, user) {
            if (user) {
                req.flash('error', '用户已存在！');
                return res.redirect('/reg');
            }
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = user;
                req.flash('success', '注册成功！');
                res.redirect('/');
            });
        });
    });
    app.get('/login', checkNotLogin, function (req, res) {
        res.render('login', {title: '登录'});
    });
    app.post('/login', checkNotLogin, function (req, res) {
        var md5, password, name;

        name = req.body.name;
        md5 = crypto.createHash('md5');
        password = req.body.password;

        if (!name || !password) {
            req.flash('error', '用户名和密码不能为空');
            return res.redirect('/reg');
        }
        password = md5.update(password).digest('hex');

        User.get(name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在！');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '密码错误！');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登陆成功！');
            res.redirect('/');
        });
    });
    app.get('/post', checkLogin, function (req, res) {
        res.render('post', {title: '发表'});
    });
    app.post('/post', checkLogin, function (req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
            } else {
                req.flash('success', '发布成功！');
            }
            res.redirect('/');
        });
    });
    app.get('/logout', checkLogin, function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });
};

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录！');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录！');
        return res.redirect('back');
    }
    next();
}
