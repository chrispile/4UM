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

var token;
var newToken;
describe('Reset', function() {
    before(function() {
        pgSetup.dropTables();
    })
    it('GET / should return empty JSON', function(done) {
        agent.get('/reset')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('GET /:token should return error object', function(done) {
        agent.get('/reset/11sdfsdkj324')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.NOT_FOUND);
            res.body.error.code.should.equal(2000);
            res.body.error.name.should.equal('Reset was not found');
            done();
        })
    });
    it('POST / should result in NOT FOUND if email does not exist in Users', function(done) {
        agent.post('/reset')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.NOT_FOUND);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            done();
        });
    });
    it('POST / should result in CREATED if email does exist in Users and a reset has not already been created', function(done) {
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'hellocuhris', password: 'test'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            agent.post('/reset')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: 'hellocuhris@gmail.com'})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.CREATED);
                assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
                done();
            });
        });
    });
    it('GET / should return one reset object', function(done) {
        agent.get('/reset')
        .end(function(err ,res) {
            res.should.be.json;
            res.body.length.should.equal(1);
            token = res.body[0].token;
            done();
        });
    });
    it('GET /:token should return reset json', function(done) {
        agent.get('/reset/' + token)
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.should.be.an('object');
            res.body.email.should.equal('hellocuhris@gmail.com');
            res.body.token.should.equal(token);
            done();
        });
    })
    it('POST / should update with a new token and return OK if a reset already exists for an email', function(done) {
        agent.post('/reset')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com'})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            assert.equal(res.header['content-type'], 'text/html; charset=utf-8');
            agent.get('/reset')
            .end(function(err ,res) {
                res.should.be.json;
                res.body.length.should.equal(1);
                newToken = res.body[0].token;
                agent.get('/reset/' + newToken)
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    res.should.be.json;
                    res.should.be.an('object');
                    res.body.email.should.equal('hellocuhris@gmail.com');
                    res.body.token.should.equal(newToken);
                    res.body.token.should.not.equal(token);
                    done();
                });
            });
        });
    });
    it('DELETE /:token should return with OK and remove token from DB', function(done) {
        agent.delete('/reset/' + newToken)
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            done();
        });
    });
    it('GET / should return empty JSON after deleting token', function(done) {
        agent.get('/reset')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('GET /:token should return error object after deleting token', function(done) {
        agent.get('/reset/' + newToken)
        .end(function(err, res) {
            res.should.have.status(HttpStatus.NOT_FOUND);
            res.body.error.code.should.equal(2000);
            res.body.error.name.should.equal('Reset was not found');
            done();
        })
    });
});
