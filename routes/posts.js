var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();

router.get('/', function(req, res, next) {
    pgClient.query("SELECT * FROM posts", [], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
});

router.get('/:sname', function(req, res, next) {
    pgClient.query("SELECT * FROM posts WHERE sname=$1", [req.params.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
});

router.post('/:sname', function(req, res, next) {
    var queryConfig = {
        text: "INSERT INTO posts(username, sname, title, text, url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        values: [res.locals.user.username , req.params.sname, req.body.title, req.body.text, req.body.url]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    });
});

router.post('/voted/:pid', function(req, res, next) {
    //add or update voted table
    // var queryConfig = {
    //     text: "UPDATE voted SET "
    // }

    //update score in posts tables
    var queryConfig = {
        text: "UPDATE posts SET SCORE = SCORE + $1 WHERE pid=$2 RETURNING SCORE",
        values: [req.body.value, req.params.pid]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0])
        }
    })
})


module.exports = router;