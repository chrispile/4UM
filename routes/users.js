var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var errorCodes = require('../errorCodes');
var HttpStatus = require('http-status-codes')

router.get('/:uid', function(req, res, next) {
    pgClient.query('SELECT * FROM USERS WHERE uid = $1', [req.params.uid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(result.rows.length == 0) {
                res.status(HttpStatus.NOT_FOUND).json({error: errorCodes.UserNotFound});
            } else {
                res.json(result.rows[0]);
            }
        }
    });
});

router.get('/', function(req, res, next) {
    pgClient.query("SELECT * FROM Users", [], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
});

router.post('/', function(req, res, next) {
    var encryptPass = sha1.hash(req.body.password);
    var queryConfig = {
        text: "INSERT INTO Users(email, username, password) VALUES ($1, $2, $3)",
        values: [req.body.email, req.body.username, encryptPass]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            if(err.constraint == 'users_username_key') {
                res.render('register', {title: 'Username taken', email:'', username:'true'}); //USERNAME IS TAKEN
            }
            else if(err.constraint == 'users_email_key') {
                res.render('register', {title: 'Email taken', email:'true', username:''}); //EMAIL IS TAKEN
            } else {
                console.log(err);
            }
        }
        else {
            //SUCCESSFUL REGISTER
            res.render('login', { title: 'Login (Success Register)', fail: ''});
        }
    });
});

router.patch('/', function(req, res, next) {
    var encryptPass = sha1.hash(req.body.password);
    pgClient.query("UPDATE USERS SET password=$1 WHERE email=$2", [encryptPass, req.body.email], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.send(HttpStatus.OK);
        }
    })
})

module.exports = router;
