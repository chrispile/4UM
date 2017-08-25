var express = require('express');
var router = express.Router();
var sha1 = require('../public/javascripts/sha1');
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var errorCodes = require('../errorCodes');
var HttpStatus = require('http-status-codes')

//Returns a Reset row by token
    //If the token is incorrect or does not exist, return an error.
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

//Returns all rows from Resets
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

//Posts new row into Resets
    //If email is incorrect, render recover page with error message
    //If a reset token already exists, update the row with a new token.
    //After inserting or updating, render the recovery email page.
router.post("/", function(req, res, next) {
    var email = req.body.email;
    pgClient.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email=$1)", [email], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            if(!result.rows[0].exists) {
                res.status(HttpStatus.NOT_FOUND).render('recover', {title: 'Recover', fail: 'true'}); //email does not exist
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
                                    res.render('email', { title: 'Login', resetLink: "/r/" + token });
                                }
                            });
                        } else {
                            console.log(err);
                        }
                    } else {
                        res.status(HttpStatus.CREATED).render('email', { title: 'Login', resetLink: "/r/" + token });
                    }
                })
            }
        }
    })
})

//Deletes a Reset row by token
router.delete("/:token", function(req, res, next) {
    pgClient.query("DELETE FROM Resets WHERE token=$1", [req.params.token], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
})

module.exports = router;
