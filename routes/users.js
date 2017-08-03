var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();

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
            console.log(err);
            if(err.constraint == 'users_username_key') {
                res.render('register', {title: 'Username taken', email:'', username:'true'}); //USERNAME IS TAKEN
            }
            else if(err.constraint == 'users_pkey') {
                res.render('register', {title: 'Email taken', email:'true', username:''}); //EMAIL IS TAKEN
            }
        }
        else {
            //SUCCESSFUL REGISETER, REDIRECT TO DASHBOARD (IMPLEMENT LATER);
            res.render('register', { title: 'Success register', email:'', username:''});
        }
    });
});


module.exports = router;
