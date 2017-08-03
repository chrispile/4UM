var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var requireLogin = require('../requireLogin.js');


router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', fail: ''});
});

router.get('/register', function(req, res, next) {
    res.render('register', {title: 'Register', email:'', username:''});
})

router.get('/recover', function(req, res, next) {
    res.render('recover', {title: 'Recover'});
})

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

router.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

module.exports = router;
