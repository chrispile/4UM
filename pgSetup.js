var pg = require('pg');
var pgClient;
var pgSetup = new function() {
    this.setup = function(conString) {
        pgClient = new pg.Client(conString);
    }
    this.connect = function() {
        pgClient.connect();
        console.log('Connected to Postgres!');
        //setup all tables if not already created
        this.createTables();
    }
    this.createTables = function() {
        pgClient.query("CREATE EXTENSION IF NOT EXISTS citext");
        pgClient.query("CREATE TABLE IF NOT EXISTS Users(uid serial PRIMARY KEY, email citext UNIQUE, username citext UNIQUE, password varchar(64), joinDate timestamp default current_timestamp )");
        pgClient.query("CREATE TABLE IF NOT EXISTS SUB4UMS(sid serial PRIMARY KEY, sname citext UNIQUE, title varchar(100), description varchar(500), type varchar(64))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Posts(pid serial, username citext REFERENCES Users(username) ON DELETE CASCADE, sname citext REFERENCES SUB4UMS(sname) ON DELETE CASCADE, title varchar(300), text varchar(40000), url varchar(200), score integer DEFAULT 0,timestamp timestamp default current_timestamp, PRIMARY KEY(pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Subscribes(uid integer REFERENCES Users(uid) ON DELETE CASCADE, sid integer REFERENCES SUB4UMS(sid) ON DELETE CASCADE, sname citext REFERENCES SUB4UMS(sname) ON DELETE CASCADE, PRIMARY KEY(uid, sid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Voted(uid integer REFERENCES Users(uid) ON DELETE CASCADE, pid integer REFERENCES Posts(pid) ON DELETE CASCADE, type varchar(64), PRIMARY KEY(uid, pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Comments(cid serial, uid integer REFERENCES Users(uid) ON DELETE CASCADE, pid integer REFERENCES Posts(pid) ON DELETE CASCADE, text varchar(1000), timestamp timestamp default current_timestamp, PRIMARY KEY(cid, uid, pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Admins(uid integer REFERENCES Users(uid) ON DELETE CASCADE, sid integer REFERENCES SUB4UMS(sid) ON DELETE CASCADE, PRIMARY KEY(uid, sid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Moderators(uid integer REFERENCES Users(uid) ON DELETE CASCADE, sid integer REFERENCES SUB4UMS(sid) ON DELETE CASCADE, PRIMARY KEY(uid, sid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Resets(email varchar(64) PRIMARY KEY, token varchar(64))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Requests(uid integer REFERENCES Users(uid) ON DELETE CASCADE, sid integer REFERENCES SUB4UMS(sid) ON DELETE CASCADE, sname citext REFERENCES SUB4UMS(sname) ON DELETE CASCADE, PRIMARY KEY(uid, sid))");
    }
    this.getClient = function() {
        return pgClient;
    }
    this.endClient = function() {
        pgClient.end();
    }
    this.dropTables = function() {
        // pgClient.query("DROP SCHEMA public CASCADE");
        // pgClient.query("CREATE SCHEMA public");
        pgClient.query("DROP TABLE Users, SUB4UMS, Posts, Subscribes, Voted, Comments, Admins, Moderators, Resets, Requests")
        this.createTables();
    }
}

module.exports = pgSetup;
