var express = require('express');
var router = express.Router();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();

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
