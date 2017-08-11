process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var pgSetup = require('../pgSetup.js');
var pgClient = pgSetup.getClient();
var HttpStatus = require('http-status-codes')

chai.use(chaiHttp);
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Users', function() {
    before(function() {
        pgSetup.truncateDB();
    })
    describe('Empty database', function() {
        it('GET / should return empty JSON', function(done) {
            chai.request(server)
            .get('/users')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /:uid should return undefined object', function(done) {
            chai.request(server)
            .get('/users/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.NOT_FOUND);
                res.should.be.json;
                res.should.be.an('object');
                res.body.error.code.should.equal(1000);
                res.body.error.name.should.equal('User was not found');
                done();
            })
        });
        // it('/POST')
    });
    // describe('Filled database', function() {
    //     before(function() {
    //
    //     });
    // })
});

describe('Posts', function() {
    before(function() {
        chai.request(server)
        .post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'hellocuhris', password: 'test'})
        .end(function(err, res)  {
            if(err) {
                console.log(err);
            } else {
                console.log('posted user?');
            }
        })
    })
    after(function() {
        pgSetup.truncateTable('Users');
    })
    // beforeEach(function() {
    //     chai.request(server)
    //     .post('/login')
    //     .send({email: 'hellocuhris@gmail.com', password: 'test'})
    //     .then(function(res) {
    //         expect(res).to.have.cookie('session');
    //
    //     })
    // })
    describe('Empty', function() {
        it('GET / should return empty JSON', function(done) {
            chai.request(server)
            .get('/posts')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
    });
    describe('Voted', function() {
        it('GET /voted should return empty JSON', function() {
            chai.request(server)
            .get('/posts/voted')
            .end(function(err, res) {

                res.should.be.json;
                done();
            });
        });
    });
});
