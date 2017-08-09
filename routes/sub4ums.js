var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();

router.get('/public', function(req, res,next) {
    pgClient.query("SELECT * FROM sub4ums WHERE type=$1", ['public'], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
});

router.get('/protected', function(req, res,next) {
    pgClient.query("SELECT * FROM sub4ums WHERE type=$1", ['protected'], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
});

router.get('/subscribe', function(req, res, next) {
    pgClient.query('SELECT * FROM subscribes WHERE uid=$1', [res.locals.user.uid], function(err, result) {
        if(err) {
            console.log(err)
        } else {
            res.json(result.rows);
        }
    })
})

router.post('/subscribe', function(req, res, next) {
    pgClient.query('INSERT INTO subscribes(uid, sid, sname) VALUES ($1, $2, $3) RETURNING *', [res.locals.user.uid, req.body.sid, req.body.sname], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

router.delete('/subscribe', function(req, res, next) {
    pgClient.query('DELETE FROM subscribes WHERE uid=$1 AND sid=$2', [res.locals.user.uid, req.body.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.status(200).end();
        }
    })
})

router.get('/sname', function(req, res, next) {
    pgClient.query('SELECT sname FROM sub4ums WHERE sid=$1', [req.body.sid], function(err, result){
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
})

//RETURNS SUB4UMS THAT THE USER IS SUBSCRIBED TO AND ALL PUBLIC SUB4UMS
router.get('/options', function(req, res, next) {
    pgClient.query("SELECT * FROM sub4ums WHERE type='public' OR sid IN (SELECT sid FROM subscribes WHERE uid=1)", [], function(err, result) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(result.rows);
        }
    })
})

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

router.post('/', function(req, res, next) {
    var queryConfig = {
        text: "INSERT INTO sub4ums(sname, title, description, type) VALUES ($1, $2, $3, $4) RETURNING *",
        values: [req.body.sname, req.body.title, req.body.description, req.body.type]
    }
    pgClient.query(queryConfig, function(err, result) {
        if(err) {
            if(err.constraint == 'sub4ums_name_key') { //NAME IS TAKEN
                res.json({});
            } else {
                console.log(err);
            }
        }
        else { //SUB4UM CREATED
            res.json(result.rows[0])
        }
    });
});

router.get('/:sid', function(req, res, next) {
    pgClient.query("SELECT * FROM sub4ums WHERE sid=$1", [req.params.sid], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result.rows[0]);
        }
    })
});


module.exports = router;
