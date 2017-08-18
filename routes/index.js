var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var requireLogin = require('../requireLogin.js');


router.get('/',  function(req, res, next) {
  res.render('login', { title: 'Login', fail: ''});
});

router.get('/register', function(req, res, next) {
    res.render('register', {title: 'Register', email:'', username:''});
})

router.get('/recover', function(req, res, next) {
    res.render('recover', {title: 'Recover', fail: ''});
})

// router.get('/post', function(req, res, next) {
//     res.render('post', {title:'Post'});
// })

router.post('/login', function(req, res, next) {
    var encryptPass = sha1.hash(req.body.password);
    var queryConfig = {
        text: "SELECT * FROM Users WHERE email=$1 AND password=$2",
        values: [req.body.email, encryptPass]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            if(result.rows.length === 0) {
                res.render('login', { title: 'Failed login', fail:'true'});
            } else {
                req.session.user = result.rows[0];
                res.redirect('/home');
            }
        }
    });
});

router.get('/home', requireLogin, function(req, res, next) {
    res.render('mainfeed', {title: 'Home'});
});

router.get('/SUB4UM', requireLogin, function(req, res, next) {
    res.render('forumlist', {title: 'SUB4UM List'});
});

router.get('/logout', requireLogin, function(req, res) {
    req.session.reset();
    res.redirect('/');
});

router.get('/s/:sname', requireLogin, function(req, res, next) {
    //check if sname is public, if not then check if user is subscribed
    queryConfig = {
        text: "SELECT * FROM sub4ums WHERE sname=$1 AND (type='public' OR EXISTS(SELECT * FROM subscribes WHERE uid=$2 AND sname=$1))",
        values: [req.params.sname, res.locals.user.uid]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(result.rows.length == 0) {
                res.redirect('/home');
            } else {
                var forum = result.rows[0];
                pgClient.query('SELECT EXISTS(SELECT 1 FROM Admins WHERE uid=$1 AND sid=$2)', [res.locals.user.uid, forum.sid], function(err, result) {
                    if(result.rows[0].exists) {
                        res.render('sub4um', {title: forum.sname, forum: forum, isAdmin: true, isMod: false});
                    } else {
                        pgClient.query('SELECT EXISTS(SELECT 1 FROM Moderators WHERE uid=$1 AND sid=$2)', [res.locals.user.uid, forum.sid], function(err, result) {
                            if(result.rows[0].exists) {
                                res.render('sub4um', {title: forum.sname, forum: forum, isAdmin: false, isMod: true});
                            } else {
                                res.render('sub4um', {title: forum.sname, forum: forum, isAdmin: false, isMod: false});
                            }
                        })
                    }
                });
            }
        }
    })
})


router.get('/s/:sname/:pid', requireLogin, function(req, res, next) {
    //check if sname is public, if not then check if user is subscribed
    queryConfig = {
        text: "SELECT * FROM sub4ums WHERE sname=$1 AND (type='public' OR EXISTS(SELECT * FROM subscribes WHERE uid=$2 AND sname=$1))",
        values: [req.params.sname, res.locals.user.uid]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(result.rows.length == 0) {
                res.redirect('/home');
            } else {
                var forum = result.rows[0];
                pgClient.query('SELECT * FROM Posts WHERE sname=$1 AND pid=$2', [req.params.sname, req.params.pid] , function(err, result) {
                    if(err) {
                        console.log(err);
                    } else if(result.rows.length == 0) {
                        res.redirect('/home');
                    } else {
                        var post = result.rows[0];
                        queryConfig = {
                            text: "SELECT EXISTS(SELECT 1 FROM (SELECT * FROM Admins UNION ALL SELECT * FROM Moderators) AS A WHERE uid=$1 AND sid = $2)",
                            values: [res.locals.user.uid, forum.sid]
                        }
                        pgClient.query(queryConfig, function(err, result) {
                            if(result.rows[0].exists) {
                                res.render('post', {title: post.title + ' | ' + forum.sname, forum: forum, post:post, canDelete: true});
                            } else {
                                res.render('post', {title:  post.title + ' | ' + forum.sname, forum, post:post, canDelete: false});
                            }
                        })
                    }
                })
            }
        }
    })
});

module.exports = router;
