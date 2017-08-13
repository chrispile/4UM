var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var errorCodes = require('../errorCodes');
var HttpStatus = require('http-status-codes')

router.get("/r/:token", function(req, res, next) {
    pgClient.query("SELECT EXISTS(SELECT 1 FROM Resets WHERE token=$1)", [req.params.token], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(result.rows[0].exists) {
                res.render('reset', {title: 'Reset Password Form', exists: true});
            } else {
                res.render('reset', {title: 'Reset Password Form', exists: false});
            }
        }
    })
})


router.get("/:token", function(req, res, next) {
    pgClient.query("SELECT * FROM Resets WHERE token=$1", [req.params.token], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            if(result.rows.length == 0) {
                res.status(HttpStatus.NOT_FOUND).json({error: errorCodes.ResetNotFound});
            } else {
                res.json(result.rows[0]);
            }
        }
    })
})

router.get("/", function(req, res, next) {
    pgClient.query("SELECT * FROM Resets", [], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
})

router.post("/", function(req, res, next) {
    var email = req.body.email;
    pgClient.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email=$1)", [email], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(!result.rows[0].exists) {
                res.render('recover', {title: 'Recover', fail: 'true'});
            } else {
                var current_date = (new Date()).valueOf().toString();
                var random = Math.random().toString();
                var token = sha1.hash(current_date + random);
                pgClient.query("INSERT INTO Resets(email, token) VALUES ($1, $2)", [email, token], function(err, result) {
                    if(err) {
                        if(err.constraint == 'resets_pkey') {
                            pgClient.query("UPDATE Resets SET token=$1 WHERE email=$2", [token, email], function(err, result) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    res.render('email', { title: 'Login', resetLink: "/reset/r/" + token });
                                }
                            });
                        } else {
                            console.log(err);
                        }
                    } else {
                        res.render('email', { title: 'Login', resetLink: "/reset/r/" + token });
                    }
                })
            }
        }
    })


})

router.delete("/:token", function(req, res, next) {
    pgClient.query("DELETE FROM Resets WHERE token=$1", [req.params.token], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.send(HttpStatus.OK);
        }
    })
})



module.exports = router;
