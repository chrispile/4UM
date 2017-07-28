var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = 'postgres://postgres:pgpass@localhost:5432/4UM'
var sha1 = require('../public/javascripts/sha1');

router.get('/', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log(err);
        }
        else {
            client.query("SELECT * FROM Users", [], function(err, result) {
                done();
                if(err) {
                    console.log(err);
                }
                else {
                    res.json(result.rows);
                }
            })
        }
    });
});

router.post('/', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log(err);
        }
        else {
            client.query("SELECT * FROM Users where email=$1", [req.body.email], function(err, result) {
                if(err) {
                    console.log(err);
                } else {
                    if(result.rows.length != 0) {
                        res.render('register', {title: 'Email taken', email:'true', username:''}); //EMAIL IS TAKEN
                    }
                    else { //IF EMAIL IS NOT TAKEN THEN
                        client.query("SELECT * FROM Users where username=$1", [req.body.username], function(err, result) {
                            if(err) {
                                console.log(err);
                            } else {
                                if(result.rows.length != 0) {
                                    res.render('register', {title: 'Username taken', email:'', username:'true'}); //USERNAME IS TAKEN
                                }
                                else { //EMAIL AND USERNAME NOT TAKEN, REGISTER NEW USER
                                    var encryptPass = sha1.hash(req.body.password);
                                    var queryConfig = {
                                        text: "INSERT INTO Users(email, username, password) VALUES ($1, $2, $3)",
                                        values: [req.body.email, req.body.username, encryptPass]
                                    }
                                    client.query(queryConfig, function(err, result) {
                                        if(err) {
                                            console.log(err);
                                        }
                                        else {
                                            //SUCCESSFUL REGISETER, REDIRECT TO DASHBOARD (IMPLEMENT LATER);
                                            res.render('register', { title: 'Success register', email:'', username:''});
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
});


module.exports = router;
