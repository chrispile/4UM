var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var errorCodes = require('../errorCodes');
var HttpStatus = require('http-status-codes')

//VOTED

    //Returns all Votes rows for the logged in user.
router.get('/voted', function(req, res, next) {
    pgClient.query("SELECT * FROM Voted WHERE uid=$1", [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
});

    //Returns the new score after updating a Post row.
        //If the type is none, it deletes the Voted row.
        //Else, it will update or insert a Voted row and update the Post with a new score.
router.post('/voted/:pid', function(req, res, next) {
    var queryConfig = {};
    if(req.body.type == "none") {
        queryConfig.text = "DELETE FROM Voted WHERE uid=$1 AND pid=$2";
        queryConfig.values = [res.locals.user.uid, req.params.pid];
    } else {
        queryConfig.text = "INSERT INTO Voted(uid, pid, type) VALUES ($1, $2, $3) ON CONFLICT(uid, pid) DO UPDATE SET type=EXCLUDED.type";
        queryConfig.values = [res.locals.user.uid, req.params.pid, req.body.type];
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            queryConfig.text = "UPDATE Posts SET SCORE = SCORE + $1 WHERE pid=$2 RETURNING SCORE";
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

//COMMENTS

    //Returns all comments of a Post by pid.
router.get('/comments/:pid', function(req, res, next) {
    var queryConfig = {
        text: "SELECT comments.cid, text, comments.timestamp, users.username as username FROM comments LEFT JOIN users ON comments.uid=users.uid WHERE pid=$1 ORDER BY timestamp",
        values: [req.params.pid]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
})

//Returns the total number of comments for a Post.
router.get('/comments/:pid/count', function(req, res, next) {
    pgClient.query("SELECT COUNT(*) FROM comments WHERE pid=$1", [req.params.pid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

//Returns the inserted Comment
router.post('/comments/:pid', function(req, res, next) {
    var queryConfig = {
        text: "INSERT INTO comments(uid, pid, text) VALUES ($1, $2, $3) RETURNING *",
        values: [res.locals.user.uid, req.params.pid, req.body.text]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            if(err.constraint == 'comments_pid_fkey') {
                res.json({error: errorCodes.PostNotFound}).status(HttpStatus.NOT_FOUND); //TEST THIS
            } else {
                console.log(err);
            }
        } else {
            var comment = result.rows[0];
            delete comment.uid;
            delete comment.pid;
            comment.username = res.locals.user.username;
            res.json(comment);
        }
    });
})

    //Deletes a Comment row by cid
router.delete('/comments/:cid', function(req, res, next) {
    pgClient.query('DELETE FROM Comments WHERE cid=$1', [req.params.cid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
});

//GENERAL ROUTES

    //Get all posts of a SUB4UM by sname
router.get('/:sname', function(req, res, next) {
    pgClient.query("SELECT * FROM posts WHERE sname=$1", [req.params.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
});

    //Get all posts from a User
router.get('/username/:username', function(req, res, next) {
    queryConfig = {
        text: "SELECT * FROM posts WHERE username=$1 AND sname in (SELECT sname FROM sub4ums WHERE type='public' OR EXISTS(SELECT * FROM subscribes WHERE uid=$2 AND subscribes.sname=sub4ums.sname))",
        values:[req.params.username, res.locals.user.uid]
    }
    pgClient.query(queryConfig , function(err, result) {
        if(err) {
            console.log(err);
        } else {

            res.json(result.rows);
        }
    })
});

    //Returns all rows from Posts
router.get('/', function(req, res, next) {
    pgClient.query("SELECT * FROM Posts", [], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows)
        }
    })
});

//Returns the inserted Posts row
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

    //Delete a post by pid
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
