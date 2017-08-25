var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup');
var pgClient = pgSetup.getClient();
var HttpStatus = require('http-status-codes')
var errorCodes = require('../errorCodes');

//Returns all messages sent to the logged in User.
router.get('/', function(req, res, next) {
    pgClient.query('SELECT * FROM Messages WHERE touser=$1 ORDER BY timestamp', [res.locals.user.username], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    });
});

//Returns the inserted Message row
    //If the user that the message is sent to does not exist, return error.
router.post('/', function(req, res, next) {
    queryConfig = {
        text: 'INSERT INTO Messages(fromUser, toUser, title, message) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [res.locals.user.username, req.body.toUser, req.body.title, req.body.message]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            if(err.constraint == 'messages_touser_fkey') {
                res.json({error: errorCodes.UserNotFound}).status(HttpStatus.NOT_FOUND);
            } else {
                console.log(err);
            }
        } else {
            res.json(result.rows[0]);
        }
    });
});

//Updates the hasRead variable for a Message by mid
router.patch('/:mid', function(req, res, next) {
    pgClient.query("UPDATE Messages SET hasRead=$1 WHERE mid=$2", [req.body.hasRead, req.params.mid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
});

//Delete a Message by mid
router.delete('/:mid', function(req, res, next) {
    pgClient.query('DELETE FROM Messages WHERE mid=$1', [req.params.mid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    });
});

module.exports = router;
