var pg = require('pg');
var conString = 'postgres://postgres:pgpass@localhost:5432/4UM';
var pgSetup = new function() {
    const pgClient = new pg.Client(conString);

    this.connect = function() {
        pgClient.connect();
        console.log('Connected to postgres');
        //setup all tables if not already created
        pgClient.query("CREATE TABLE IF NOT EXISTS Users(uid serial PRIMARY KEY, email varchar(64) UNIQUE, username varchar(64) UNIQUE, password varchar(64))");
        pgClient.query("CREATE TABLE IF NOT EXISTS SUB4UMS(sid serial PRIMARY KEY, sname varchar(100) UNIQUE, title varchar(100), description varchar(500), type varchar(64))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Posts(pid serial, username varchar(64) REFERENCES Users(username), sname varchar(100) REFERENCES SUB4UMS(sname), title varchar(300), text varchar(40000), url varchar(200), score integer DEFAULT 0,timestamp timestamp default current_timestamp, PRIMARY KEY(pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Subscribes(uid integer, sid integer, sname varchar(100) REFERENCES SUB4UMS(sname), PRIMARY KEY(uid, sid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Voted(uid integer, pid integer, type varchar(64), PRIMARY KEY(uid, pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Comments(cid serial, uid integer, pid integer, text varchar(1000), PRIMARY KEY(cid, uid, pid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Admins(uid integer, sid integer, PRIMARY KEY(uid, sid))");
        pgClient.query("CREATE TABLE IF NOT EXISTS Moderators(uid integer, sid integer, PRIMARY KEY(uid, sid))");
    }
    this.getClient = function() {
        return pgClient;
    }
    this.endClient = function() {
        pgClient.end();
    }
}

module.exports = pgSetup;
