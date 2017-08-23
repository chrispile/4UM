process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var pgSetup = require('../pgSetup.js');
var HttpStatus = require('http-status-codes')
var sha1 = require('../public/javascripts/sha1.js');
chai.use(chaiHttp);
var should = chai.should();
var pgClient = pgSetup.getClient();
var assert = chai.assert;
var should = chai.should();
var agent = chai.request.agent(server)

describe('Users', function() {
    before(function() {
        pgSetup.dropTables();
    });
    it('GET / should return empty JSON', function(done) {
        agent.get('/users')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('GET /:uid should return undefined object', function(done) {
        agent.get('/users/1')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.NOT_FOUND);
            res.body.error.code.should.equal(1000);
            res.body.error.name.should.equal('User was not found');
            done();
        })
    });
    it('/POST renders login and inserts in User table', function(done) {
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'hellocuhris', password: 'test'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            done();
        });
    });
    it('/GET uid=1 should return User that was just inserted', function(done) {
        agent.get('/users/1')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.should.be.an('object');
            res.body.uid.should.equal(1);
            res.body.username.should.equal('hellocuhris');
            res.body.email.should.equal('hellocuhris@gmail.com');
            var hashpass = sha1.hash('test');
            res.body.password.should.equal(hashpass);
            agent.get('/users')
            .end(function(err ,res) {
                res.should.be.json;
                res.body.length.should.equal(1);
            })
            done();
        });
    });
    it("/POST should have status CONFLICT when inserting a user with an existing email", function(done) {
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'theportal', password: 'somepassword'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.CONFLICT);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            agent.get('/users')
            .end(function(err ,res) {
                res.should.be.json;
                res.body.length.should.equal(1);
            })
            done();
        });
    });
    it("/POST should have status CONFLICT when inserting a user with an existing username", function(done) {
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'theportal@gmail.com', username: 'hellocuhris', password: 'somepassword'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.CONFLICT);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            agent.get('/users')
            .end(function(err ,res) {
                res.should.be.json;
                res.body.length.should.equal(1);
            })
            done();
        });
    });
    it("/PATCH should return OK and update user password", function(done) {
        agent.patch('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({password: 'newpass', email: 'hellocuhris@gmail.com'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            agent.get('/users/1')
            .end(function(err ,res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.should.be.an('object');
                res.body.uid.should.equal(1);
                res.body.username.should.equal('hellocuhris');
                res.body.email.should.equal('hellocuhris@gmail.com');
                var hashpass = sha1.hash('newpass');
                res.body.password.should.equal(hashpass);
            })
            done();
        });
    });
});
