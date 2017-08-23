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

describe('Posts', function() {
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
                expect(res).to.have.cookie('session');
                agent.post('/sub4ums')  //POST NEW SUB4UM
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    sname: 'GameOfThrones',
                    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis.',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis. Etiam felis tellus, tincidunt vitae tellus a, aliquet consequat est. Integer fermentum tortor dolor, quis scelerisque dolor euismod vitae. Curabitur tincidunt faucibus pharetra. Maecenas nec mi in tortor maximus aliquam. Maecenas sed blandit augue. Duis sit amet porttitor risus. Quisque vitae dignissim metus. Suspendisse potenti. Nam nec ante at sapien tempor scelerisque.',
                    type: 'public'})
                .end(function(err, res) {
                    done();
                });
            });
        });
    })
    it('GET / should return empty array', function(done) {
        agent.get('/posts')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('GET /:sname should return empty array', function(done) {
        agent.get('/posts/GameOfThrones')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('GET /username/:username/:sname should return empty array', function(done) {
        agent.get('/posts/username/hellocuhris/GameOfThrones')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('POST /:sname should return row that was inserted', function(done) {
        agent.post('/posts/GameOfThrones')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
            sname: 'GameOfThrones',
            title: 'New Episode Discussion',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            url: null})
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
            res.should.be.json;
            res.body.pid.should.equal(1);
            res.body.sname.should.equal('GameOfThrones');
            res.body.title.should.equal('New Episode Discussion');
            res.body.text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            res.body.url.should.equal('');
            res.body.score.should.equal(0);
            done();
        });
    });
    it('GET / should return array with one row', function(done) {
        agent.get('/posts')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(1);
            res.body.should.be.a('array').that.is.not.empty;
            res.body[0].pid.should.equal(1);
            res.body[0].sname.should.equal('GameOfThrones');
            res.body[0].title.should.equal('New Episode Discussion');
            res.body[0].text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            res.body[0].url.should.equal('');
            res.body[0].score.should.equal(0);
            done();
        });
    });
    it('GET /:sname should return array with one row', function(done) {
        agent.get('/posts/GameOfThrones')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(1);
            res.body.should.be.a('array').that.is.not.empty;
            res.body[0].pid.should.equal(1);
            res.body[0].sname.should.equal('GameOfThrones');
            res.body[0].title.should.equal('New Episode Discussion');
            res.body[0].text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            res.body[0].url.should.equal('');
            res.body[0].score.should.equal(0);
            done();
        });
    });
    it('GET /username/:username/:sname should return array with one row', function(done) {
        agent.get('/posts/username/hellocuhris/GameOfThrones')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(1);
            res.body.should.be.a('array').that.is.not.empty;
            res.body[0].pid.should.equal(1);
            res.body[0].sname.should.equal('GameOfThrones');
            res.body[0].title.should.equal('New Episode Discussion');
            res.body[0].text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            res.body[0].url.should.equal('');
            res.body[0].score.should.equal(0);
            done();
        });
    });
    describe('Voted', function() {
        it('GET /voted should return empty array', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
        it('POST /voted with value upvote should return new score as 1 from 0', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'upvote' , value: 1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(1);
                done();
            });
        });
        it('GET /voted should return array with one row', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].pid.should.equal(1);
                res.body[0].type.should.equal('upvote');
                done();
            });
        })
        it('POST /voted with value none should return new score as 0 from 1', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'none' , value: -1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(0);
                done();
            });
        });
        it('GET /voted should return empty array', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
        it('POST /voted with value downvote should return new score as -1 from 0', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'downvote' , value: -1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(-1);
                done();
            });
        });
        it('GET /voted should return array with one row', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].pid.should.equal(1);
                res.body[0].type.should.equal('downvote');
                done();
            });
        })
        it('POST /voted with value none should return new score as 0 from -1', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'none' , value: 1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(0);
                done();
            });
        });
        it('GET /voted should return empty array', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
        it('POST /voted with value upvote should return new score increased by 1 from 0', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'upvote' , value: 1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(1);
                done();
            });
        });
        it('POST /voted with value downvote should return new score as -1 from 1', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'downvote' , value: -2})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(-1);
                done();
            });
        });
        it('POST /voted with value upvote should return new score as 1 from -1', function(done) {
            agent.post('/posts/voted/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({type: 'upvote' , value: 2})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.score.should.equal(1);
                done();
            });
        });
    })
    describe('Comments', function() {
        it('GET /comments/:pid returns empty array', function(done) {
            agent.get('/posts/comments/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            })
        });
        it('GET /comments/:pid/count returns count of 0', function(done) {
            agent.get('/posts/comments/1/count')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.count.should.equal('0');
                done();
            })
        });
        it('POST /comments/:pid should return row that was inserted', function(done) {
            agent.post('/posts/comments/1')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.cid.should.equal(1);
                res.body.text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                done();
            });
        })
        it('GET /comments/:pid returns array with one row', function(done) {
            agent.get('/posts/comments/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].cid.should.equal(1);
                res.body[0].text.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                done();
            })
        });
        it('GET /comments/:pid/count returns count of 1', function(done) {
            agent.get('/posts/comments/1/count')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.count.should.equal('1');
                done();
            })
        });
    })
    describe('Delete', function() {
        it('DELETE / should return OK', function(done) {
            agent.delete('/posts')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({pid: 1})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                done();
            })
        });
        it('GET / should return empty array', function(done) {
            agent.get('/posts')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /:sname should return empty array', function(done) {
            agent.get('/posts/GameOfThrones')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /username/:username/:sname should return empty array', function(done) {
            agent.get('/posts/username/hellocuhris/GameOfThrones')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /voted should return empty array', function(done) {
            agent.get('/posts/voted')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
        it('GET /comments/:pid returns empty array', function(done) {
            agent.get('/posts/comments/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            })
        });
    })
});
