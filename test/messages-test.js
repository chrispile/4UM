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
var expect = chai.expect;
var agent = chai.request.agent(server);

describe('Messages', function() {
    before(function(done) {
        pgSetup.dropTables();
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'hellocuhris', password: 'test'})
        .end(function(err, res) {
            agent.post('/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: 'hellocuhris@gmail.com', password: 'test'})
            .end(function(Err, res) {
                agent.post('/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: 'theportal@gmail.com', username: 'theportal', password: 'somepass'})
                .end(function(err, res) {
                    done();
                });
            });
        });
    });
    it('GET / should return empty array', function(done) {
        agent.get('/messages')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('POST / should return message that was inserted', function(done) {
        agent.post('/messages')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
            toUser: 'theportal',
            title: 'This is a title for a message',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        })
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
            res.should.be.json;
            res.body.fromuser.should.equal('hellocuhris');
            res.body.touser.should.equal('theportal');
            res.body.title.should.equal('This is a title for a message');
            res.body.message.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            res.body.hasread.should.be.false;
            done();
        });
    });
    it('GET / should return array with one row after logging in to the user who received the message', function(done) {
        agent.post('/logout')
        .end(function(err, result) {
            agent.post('/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: 'theportal@gmail.com', password: 'somepass'})
            .end(function(err, res) {
                agent.get('/messages')
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    res.should.be.json;
                    res.body.length.should.equal(1);
                    res.body.should.be.a('array').that.is.not.empty;
                    done();
                });
            });
        })
    });
    it('PATCH /:mid should return OK and change the messages hasRead value', function(done) {
        agent.patch('/messages/1')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({hasRead: true})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            agent.get('/messages')
            .end(function(err, res) {
                res.body[0].hasread.should.be.true;
                done();
            });
        });
    });
    it('DELETE /:mid should return OK', function(done) {
        agent.delete('/messages/1')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            done();
        })
    });
    it('GET / should return empty array', function(done) {
        agent.get('/messages')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
});
