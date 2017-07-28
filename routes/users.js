var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = 'postgres://postgres:pgpass@localhost:5432/4UM'


/* GET users listing. */
router.get('/', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log(err);
        }
        else {
            client.query("SELECT email, username FROM Users", [], function(err, result) {
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
            client.query("CREATE TABLE IF NOT EXISTS Users(email varchar(64), username varchar(64), password varchar(64))");
            var queryConfig = {
                text: "INSERT INTO Users(email, username, password) values($1, $2, $3)",
                values: [req.body.email, req.body.username, req.body.password]
            }
            client.query(queryConfig, function(err, result) {
                if(err) {
                    console.log(err);
                }
                else {
                    res.redirect('/');
                }
            });
        }
    });
});

module.exports = router;
