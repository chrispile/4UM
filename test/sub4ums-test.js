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
var agent = chai.request.agent(server)

describe('SUB4UMs', function() {
    before(function() {
        pgSetup.dropTables();
    });
    it('GET / should return empty JSON', function(done) {
        agent.get('/sub4ums')
        .end(function(err, res) {
            res.should.have.status(HttpStatus.OK);
            res.should.be.json;
            res.body.length.should.equal(0);
            res.body.should.be.a('array').that.is.empty;
            done();
        });
    });
    it('POST / should return forum and the admin for the forum', function(done) {
        agent.post('/users')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({email: 'hellocuhris@gmail.com', username: 'hellocuhris', password: 'test'})
        .end(function(err, res) {
            agent.post('/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: 'hellocuhris@gmail.com', password: 'test'})
            .end(function(Err, res) {
                expect(res).to.have.cookie('session');
                agent.get('/sub4ums/admin') //CHECK IF THERE IS NO SUB4UMS THAT THE USER IS AN ADMIN FOR
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    res.should.be.json;
                    res.body.length.should.equal(0);
                    res.body.should.be.a('array').that.is.empty;
                });
                agent.post('/sub4ums')  //POST NEW SUB4UM
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    sname: 'GameOfThrones',
                    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis.',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis. Etiam felis tellus, tincidunt vitae tellus a, aliquet consequat est. Integer fermentum tortor dolor, quis scelerisque dolor euismod vitae. Curabitur tincidunt faucibus pharetra. Maecenas nec mi in tortor maximus aliquam. Maecenas sed blandit augue. Duis sit amet porttitor risus. Quisque vitae dignissim metus. Suspendisse potenti. Nam nec ante at sapien tempor scelerisque.',
                    type: 'public'})
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
                    res.body.length.should.equal(2);
                    var forum = res.body[0];
                    forum.sname.should.equal('GameOfThrones');
                    forum.title.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis.');
                    forum.description.should.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor ultrices lorem id venenatis. Etiam felis tellus, tincidunt vitae tellus a, aliquet consequat est. Integer fermentum tortor dolor, quis scelerisque dolor euismod vitae. Curabitur tincidunt faucibus pharetra. Maecenas nec mi in tortor maximus aliquam. Maecenas sed blandit augue. Duis sit amet porttitor risus. Quisque vitae dignissim metus. Suspendisse potenti. Nam nec ante at sapien tempor scelerisque.')
                    forum.type.should.equal('public');
                    var admin = res.body[1];
                    admin.uid.should.equal(1);
                    admin.sid.should.equal(1);
                    done();
                });
            })
        });
    })
    describe('User logged in and one SUB4UM created', function() {
        it('POST / with existing SUB4UM sname should return an error', function(done) {
            agent.post('/sub4ums')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                sname: 'GameOfThrones',
                title: 'This is a different title',
                description: 'This is a different description',
                type: 'protected'})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.error.code.should.equal(3000);
                res.body.error.name.should.equal('The SUB4UM name is already taken');
                done();
            });
        });
        it('GET / should return only one SUB4UM in array', function(done) {
            agent.get('/sub4ums')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                res.body.should.be.a('array').that.is.not.empty;
                done();
            });
        });
        it('GET /sname/:sname should return one SUB4UM in array', function(done) {
            agent.get('/sub4ums/sname/' + 'GameOfThrones')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                res.body.should.be.a('array').that.is.not.empty;
                done();
            });
        })
        it('GET /admin should return one row with uid=1 and sid=1', function(done) {
            agent.get('/sub4ums/admin')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                done();
            });
        });
        it('GET /subscribe should return one row with uid=1, sid=1, and sname="GameOfThrones"', function(done) {
            agent.get('/sub4ums/subscribe')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                res.body.should.be.a('array').that.is.not.empty;
                done();
            });
        })
    });
    var newUserUID;
    describe('Moderators', function() {
        before(function(done) {
            agent.post('/users')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: 'theportal@gmail.com', username: 'theportal', password: 'portal'})
            .end(function(err, res) {
                agent.get('/users')
                .end(function(err, res) {
                    newUserUID = res.body[1].uid;
                    done();
                })
            })
        });
        it('GET /mods should return empty array', function(done) {
            agent.get('/sub4ums/mods')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /mods/1 should return empty array', function(done) {
            agent.get('/sub4ums/mods/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('POST /mod should return json of Moderator that was inserted', function(done) {
            agent.post('/sub4ums/mod')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({uid: newUserUID, sid: 1,})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.uid.should.equal(newUserUID);
                res.body.sid.should.equal(1);
                done();
            });
        });
        it('GET /mods should return array with no rows because the logged in user is not a mod', function(done) {
            agent.get('/sub4ums/mods')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        });
        it('GET /mods/1 should return array with one Moderator', function(done) {
            agent.get('/sub4ums/mods/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(newUserUID);
                res.body[0].sid.should.equal(1);
                done();
            });
        });
        it('GET /mods should return array with 1 row after logged in user POSTS as mod', function(done) {
            agent.post('/sub4ums/mod')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({uid: 1, sid: 1,})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.uid.should.equal(1);
                res.body.sid.should.equal(1);
                agent.get('/sub4ums/mods')
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    res.should.be.json;
                    res.body.length.should.equal(1);
                    res.body.should.be.a('array').that.is.not.empty;
                    res.body[0].uid.should.equal(1);
                    res.body[0].sid.should.equal(1);
                    done();
                });
            });
        });
        it('GET /mods/1 should return array with two Moderators', function(done) {
            agent.get('/sub4ums/mods/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.body.length.should.equal(2);
                res.body.should.be.a('array').that.is.not.empty;
                done();
            });
        });
        it('DELETE /mods should return OK', function(done) {
            agent.delete('/sub4ums/mod/' + newUserUID)
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                done();
            });
        });
        it('GET /mods/1 should return array with one Moderator', function(done) {
            agent.get('/sub4ums/mods/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                done();
            });
        });
    });
    var newForumSID;
    var newForumSNAME
    describe('Subscribes', function() {
        before(function(done) {
            agent.post('/sub4ums')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                sname: 'TodayILearned',
                title: 'This is a title for TIL',
                description: 'This is a random description for TIL',
                type: 'protected'})
            .end(function(err, res) {
                newForumSID = res.body[0].sid;
                newForumSNAME = res.body[0].sname;
                done();
            })
        })
        it('GET /subcribe should return 2 rows', function(done) {
            agent.get('/sub4ums/subscribe')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(2);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                res.body[1].uid.should.equal(1);
                res.body[1].sid.should.equal(3);
                res.body[1].sname.should.equal('TodayILearned');
                done();
            })
        });
        it('GET /suscribe/:sid should return no rows since the user is subscribed', function(done) {
            agent.get('/sub4ums/subscribers/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            })
        })
        it('POST /subscribe/:uid should return the inserted subscribed user (not the currently logged in one)', function(done) {
            agent.post('/sub4ums/subscribe/' + newUserUID)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({sid: 1, sname: 'GameOfThrones'})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.uid.should.equal(newUserUID);
                res.body.sid.should.equal(1);
                res.body.sname.should.equal('GameOfThrones');
                done();
            })
        })
        it('GET /suscribe/:sid should return the user who just subscribed in previous test', function(done) {
            agent.get('/sub4ums/subscribers/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(newUserUID);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                done();
            })
        })
        it('DELETE /subscribe should return OK', function(done) {
            agent.delete('/sub4ums/subscribe')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({sid: newForumSID})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                agent.get('/sub4ums/subscribe')
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    res.should.be.json;
                    res.body.length.should.equal(1);
                    res.body.should.be.a('array').that.is.not.empty;
                    done();
                })
            })
        })
        it('POST /subscribe should return the row that was inserted', function(done) {
            agent.post('/sub4ums/subscribe')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({sid: newForumSID, sname: newForumSNAME})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.uid.should.equal(1);
                res.body.sid.should.equal(newForumSID);
                res.body.sname.should.equal(newForumSNAME);
                done();
            })
        });
    });
    describe('Requests', function() {
        before(function(done) {
            agent.delete('/sub4ums/subscribe')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({sid: 1})
            .end(function(err, res) {
                done();
            });
        })
        it('GET /requests/1 should return empty array', function(done) {
            agent.get('/sub4ums/requests/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            })
        })
        it('GET /requests should return empty array', function(done) {
            agent.get('/sub4ums/requests')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
        it('POST /requests should return the inserted row', function(done) {
            agent.post('/sub4ums/request')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({sid: 1, sname:'GameOfThrones'})
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.uid.should.equal(1);
                res.body.sid.should.equal(1);
                res.body.sname.should.equal('GameOfThrones');
                done();
            });
        })
        it('GET /requests/1 should return one row in array', function(done) {
            agent.get('/sub4ums/requests/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                done();
            })
        })
        it('GET /requests should return one row in array', function(done) {
            agent.get('/sub4ums/requests')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(1);
                res.body.should.be.a('array').that.is.not.empty;
                res.body[0].uid.should.equal(1);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                done();
            });
        });
        it('DELETE /requests should return OK', function(done) {
            agent.delete('/sub4ums/requests/1/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                done();
            })
        });
        it('GET /requests/1 should return empty array', function(done) {
            agent.get('/sub4ums/requests/1')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            })
        })
        it('GET /requests should return empty array', function(done) {
            agent.get('/sub4ums/requests')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(0);
                res.body.should.be.a('array').that.is.empty;
                done();
            });
        })
    })
    describe('Qualified', function() {
        it('GET /qualified/GameOfThrones should result true since logged in user is Admin', function(done) {
            agent.get('/sub4ums/qualified/GameOfThrones')
            .end(function(err, res){
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.qualified.should.equal(true);
                done();
            })
        });
        it('GET /qualified/GameOfThrones should result false for user who is not mod or admin', function(done) {
            agent.get('/logout')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                agent.post('/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: 'theportal@gmail.com', password: 'portal'})
                .end(function(err, res) {
                    agent.get('/sub4ums/qualified/GameOfThrones')
                    .end(function(err, res){
                        res.should.have.status(HttpStatus.OK);
                        res.should.be.json;
                        res.body.qualified.should.equal(false);
                        done();
                    })
                })
            })
        })
    })
    var newForumSID;
    describe('Options', function(done) {
        before(function(done) {
            agent.post('/sub4ums')  //POST NEW SUB4UM
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                sname: 'News',
                title: 'This is a title for News',
                description: 'This is a random description for News',
                type: 'protected'})
            .end(function(err, res) {
                newForumSID = res.body[0].sid;
                done();
            })
        })
        it('GET /options will return 2 sub4ums (one that is public and one that the user is subscribed to)', function(done) {
            agent.get('/sub4ums/options')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.should.be.json;
                res.body.length.should.equal(2);
                res.body[0].sid.should.equal(1);
                res.body[0].sname.should.equal('GameOfThrones');
                res.body[0].type.should.equal('public');
                res.body[1].sid.should.equal(newForumSID);
                res.body[1].sname.should.equal('News');
                res.body[1].type.should.equal('protected');
                done();
            })
        })
    });
    describe('Delete', function(){
        it('Delete /:sname should return OK', function(done){
            agent.delete('/sub4ums/News')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                done();
            })
        })
        it('GET / should return array with 2 sub4ums', function(done){
            agent.get('/sub4ums')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                res.body.length.should.equal(2);
                done();
            })
        })
        it('GET / should return empty array afer deleting two sub4ums', function(done) {
            agent.delete('/sub4ums/TodayILearned')
            .end(function(err, res) {
                res.should.have.status(HttpStatus.OK);
                agent.delete('/sub4ums/GameOfThrones')
                .end(function(err, res) {
                    res.should.have.status(HttpStatus.OK);
                    agent.get('/sub4ums')
                    .end(function(err, res) {
                        res.should.have.status(HttpStatus.OK);
                        res.should.be.json;
                        res.body.length.should.equal(0);
                        res.body.should.be.a('array').that.is.empty;
                        done();
                    });
                })
            })
        })
    })
});
