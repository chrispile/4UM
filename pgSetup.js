var pg = require('pg');
var conString = 'postgres://postgres:pgpass@localhost:5432/4UM';
var pgSetup = new function() {
    const pgClient = new pg.Client(conString);

    this.connect = function() {
        pgClient.connect();
        console.log('Connected to postgres');
        //setup all tables if not already created
        pgClient.query("CREATE TABLE IF NOT EXISTS Users(email varchar(64) PRIMARY KEY, username varchar(64) UNIQUE, password varchar(64))");
    }
    this.getClient = function() {
        return pgClient;
    }
    this.endClient = function() {
        pgClient.end();
    }
}

module.exports = pgSetup;
