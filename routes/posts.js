var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var HttpStatus = require('http-status-codes')


router.get('/voted', function(req, res, next) {
    pgClient.query("SELECT * FROM voted WHERE uid=$1", [res.locals.user.uid], function(err, result) {
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

router.get('/', function(req, res, next) {
    pgClient.query("SELECT * FROM posts", [], function(err, result) {
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
    var queryConfig = {};
    if(req.body.type == "none") {
        queryConfig.text = "DELETE FROM voted WHERE uid=$1 AND pid=$2";
        queryConfig.values = [res.locals.user.uid, req.params.pid];
    } else {
        queryConfig.text = "INSERT INTO voted(uid, pid, type) VALUES ($1, $2, $3) ON CONFLICT(uid, pid) DO UPDATE SET type=EXCLUDED.type";
        queryConfig.values = [res.locals.user.uid, req.params.pid, req.body.type];
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            queryConfig.text = "UPDATE posts SET SCORE = SCORE + $1 WHERE pid=$2 RETURNING SCORE";
            queryConfig.values = [req.body.value, req.params.pid];
            //update score in posts tables
            pgClient.query(queryConfig, function(err, result) {
                if(err) {
                    console.log(err);
                } else {
                    res.json(result.rows[0])
                }
            })
        }
    });
})

router.delete('/', function(req, res, next) {
    pgClient.query('DELETE FROM Posts WHERE pid=$1', [req.body.pid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
})

module.exports = router;
