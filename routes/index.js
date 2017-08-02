var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = 'postgres://postgres:pgpass@localhost:5432/4UM'
var sha1 = require('../public/javascripts/sha1');

/* GET home page. */
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
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log(err);
        }
        else {
            var encryptPass = sha1.hash(req.body.password);
            var queryConfig = {
                text: "SELECT * FROM Users WHERE email=$1 AND password=$2",
                values: [req.body.email, encryptPass]
            }
            client.query(queryConfig, function(err, result) {
                done();
                if(err) {
                    console.log(err);
                }
                else {
                    if(result.rows.length === 0) {
                        res.render('login', { title: 'Failed login', fail:'true'});
                    } else {
                        res.render('login', {title: 'Login Success', fail:''}) //LOGIN SUCCESSFUL (REDIRECT THEM TO HOMEPAGE LATER)
                    }
                }
            });
        }
    })
});

module.exports = router;
