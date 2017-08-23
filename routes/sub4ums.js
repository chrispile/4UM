var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var errorCodes = require('../errorCodes');
var HttpStatus = require('http-status-codes')


//SUBSCRIBES

    // Returns all subscribers to a SUB4UM except if the logged in user is a moderator for that SUB4UM [CONFIRMED]
router.get('/subscribers/:sid', function(req, res, next) {
    queryConfig = {
        text: "SELECT users.uid, sid, sname, username FROM subscribes LEFT JOIN users on subscribes.uid = users.uid WHERE sid=$1 AND subscribes.uid!=$2 AND subscribes.uid NOT IN (SELECT uid FROM moderators where sid=$1)",
        values: [req.params.sid, res.locals.user.uid]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err)
        } else {
            res.json(result.rows);
        }
    })
})

    //Returns all SUB4UMs that the logged in user is subscribed to [CONFIRMED]
router.get('/subscribe', function(req, res, next) {
    pgClient.query('SELECT * FROM subscribes WHERE uid=$1', [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err)
        } else {
            res.json(result.rows);
        }
    })
})

router.post('/subscribe/private/:accesscode', function(req, res, next) {
    pgClient.query("SELECT sid, sname FROM sub4ums WHERE accesscode=$1", [req.params.accesscode], function(err, result) {
        if(err) {
            console.log(err)
        } else {
            if(result.rows.length == 0) {
                res.json({error:errorCodes.AccessCodeDoesNotExist}).status(HttpStatus.NOT_FOUND);
                console.log('what');
            } else {
                var sid = result.rows[0].sid;
                var sname = result.rows[0].sname;
                pgClient.query('INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [res.locals.user.uid, sid, sname], function(err, result) {
                    if(err) {
                        if(err.constraint == 'subscribes_pkey') {
                            console.log('what');
                            res.json({error: errorCodes.AlreadySubscribed}).status(HttpStatus.CONFLICT);
                        } else {
                            console.log(err);
                        }
                    } else {
                        res.json(result.rows[0]);
                    }
                });
            }
        }
    })
});

    //Used to confirm a pending request by subscribing a user to a sub4um [CONFIRMED]
router.post('/subscribe/:uid', function(req, res, next) {
    pgClient.query('INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [req.params.uid, req.body.sid, req.body.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

    // Subscribes the logged-in user to a sub4um [CONFIRMED] TESTED
router.post('/subscribe', function(req, res, next) {
    pgClient.query('INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [res.locals.user.uid, req.body.sid, req.body.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

    // Deletes the logged-in user's subscription to a sub4um [CONFIRMED]
router.delete('/subscribe', function(req, res, next) {
    pgClient.query('DELETE FROM subscribes WHERE uid=$1 AND sid=$2', [res.locals.user.uid, req.body.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
})

//ADMINS

    //Returns all SIDs that the logged in user is an Admin for. [CONFIRMED]
router.get('/admin', function(req, res, next) {
    pgClient.query("SELECT * FROM Admins WHERE uid=$1", [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
})


//MODERATORS

    //Returns all SIDs that the logged in user is a Moderator for. [CONFIRMED]
router.get('/mods', function(req, res, next) {
    pgClient.query("SELECT * FROM Moderators WHERE uid=$1", [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
})

    //Returns all moderators for one SUB4UM by sid. [CONFIRMED]
router.get('/mods/:sid', function(req, res, next) {
    pgClient.query("SELECT Users.uid, sid, username FROM Moderators LEFT JOIN Users ON Moderators.uid = Users.uid WHERE sid=$1", [req.params.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
})

    // [CONFIRMED]
router.post('/mod', function(req, res, next) {
    pgClient.query('INSERT INTO moderators(uid, sid) VALUES ($1, $2) RETURNING *', [req.body.uid, req.body.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})


    // [CONFIRMED]
router.delete('/mod/:uid', function(req, res, next) {
    pgClient.query('DELETE FROM Moderators WHERE uid=$1', [req.params.uid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
})

//REQUESTS

    // Gets all requests for a sub4um [CONFIRMED]
router.get('/requests/:sid', function(req, res, next) {
    pgClient.query('SELECT sid, sname, Users.uid, username FROM Requests LEFT JOIN Users ON Requests.uid=Users.uid WHERE sid=$1', [req.params.sid], function(err, result) {
        if(err) {
            console.log(err)
        } else {
            res.json(result.rows);
        }
    })
})

    // Used to see which sub4ums the logged in user is pending for on the SUB4UM list page [CONFIRMED]
router.get('/requests', function(req, res, next) {
    pgClient.query('SELECT * FROM requests WHERE uid=$1', [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err)
        } else {
            res.json(result.rows);
        }
    })
})

    // [CONFIRMED]
router.post('/request', function(req, res, next) {
    pgClient.query('INSERT INTO requests(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [res.locals.user.uid, req.body.sid, req.body.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

    // [CONFIRMED]
router.delete('/requests/:uid/:sid', function(req, res, next) {
    pgClient.query('DELETE FROM requests WHERE uid=$1 AND sid=$2', [req.params.uid, req.params.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            pgClient.query('INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [req.params.uid, req.params.sid, req.body.sname], function(err, result) {
                if(err) {
                    console.log(err);
                } else {
                    res.sendStatus(HttpStatus.OK);
                }
            })
        }
    })
})


//GENERAL ROUTES

//Checks if the user is either an Admin or Moderator for the specified SUB4UM.
//This is used to determine if they can delete posts [CONFIRMED]
router.get('/qualified/:sname', function(req, res, next) {
    var queryConfig = {
        text: "SELECT EXISTS(SELECT * FROM (SELECT uid FROM Moderators left join sub4ums on moderators.sid = sub4ums.sid WHERE sub4ums.sname = $2 UNION ALL SELECT uid FROM Admins left join sub4ums on Admins.sid = sub4ums.sid WHERE sub4ums.sname = $2) AS A WHERE uid=$1)",
        values: [res.locals.user.uid, req.params.sname]
    };
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            console.log(err)
        } else {
            if(result.rows[0].exists) {
                res.json({qualified: true});
            } else {
                res.json({qualified: false});
            }
        }
    })
})

    //Returns a sub4um by SNAME [CONFIRMED]
router.get('/sname/:sname', function(req, res, next) {
    pgClient.query("SELECT * FROM sub4ums WHERE sname=$1", [req.params.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows);
        }
    })
});

    //RETURNS SUB4UMS THAT THE USER IS SUBSCRIBED TO AND ALL PUBLIC SUB4UMS [CONFIRMED]
router.get('/options', function(req, res, next) {
    pgClient.query("SELECT * FROM sub4ums WHERE type='public' OR sid IN (SELECT sid FROM subscribes WHERE uid=$1)", [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
})

    //Returns ALL sub4ums [CONFIRMED]
router.get('/', function(req, res, next) {
    pgClient.query("SELECT * FROM sub4ums", [], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
});

    // Posts new SUB4UM [CONFIRMED]
router.post('/', function(req, res, next) {
    if(req.body.type == 'private') {
        var accesscode = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 8; i > 0; --i) accesscode += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    var queryConfig = {
        text: "INSERT INTO sub4ums(sname, title, description, type, accesscode) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        values: [req.body.sname, req.body.title, req.body.description, req.body.type, accesscode]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            if(err.constraint == 'sub4ums_sname_key') { //NAME IS TAKEN
                res.json({error: errorCodes.SnameTaken});
            } else {
                console.log(err);
            }
        }
        else {
            forum = result.rows[0];
            var sid = forum.sid;
            queryConfig = {
                text: 'INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3)',
                values: [res.locals.user.uid, sid, req.body.sname]
            }
            pgClient.query( queryConfig, function(err, result) {
                if(err) {
                    console.log(err);
                } else {
                    pgClient.query('INSERT INTO Admins(uid, sid) VALUES ($1, $2) RETURNING *', [res.locals.user.uid, sid], function(err, result) {
                        if(err) {
                            console.log(err)
                        } else {
                            res.json([forum, result.rows[0]]);
                        }
                    })
                }
            })
        }
    });
});

// [CONFIRMED]
router.delete('/:sname', function(req, res, next) {
    pgClient.query('DELETE FROM sub4ums WHERE sname=$1', [req.params.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.sendStatus(HttpStatus.OK);
        }
    })
})

module.exports = router;
