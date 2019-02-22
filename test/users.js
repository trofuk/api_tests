process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../users/user.model.js');

let chai = require('chai');
let expect = require('chai').expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let request = require('supertest');
let jwt = require('jsonwebtoken');
let config = require('../config/config.js');
let token;
let userCount;

chai.use(chaiHttp);

User.countDocuments({}, function(err, count) {
    if (err) { return handleError(err) }
    userCount = count;
});

before(function(done){

    request(server)
        .post('/users/authenticate')
        .type('json')
        .send('{"username":"trof","password":"private"}')
        .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).have.property('token');
            token = 'Bearer ' + res.body.token;
            done();
        });

});

describe('/GET user', () => {
    it('it should GET current user', (done) => {
        request(server)
            .get('/users/current')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.username.should.be.eql("trof");
                expect(res.body).have.property('_id');
                expect(res.body).have.property('username');

                done();
            });
    });
    it('it should GET all users', (done) => {
        request(server)
            .get('/users/')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(userCount);
                done();
            });
    });
    it('it should GET wrong user', (done) => {
        request(server)
            .get('/users/id:bad')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                done();
            });
    });

});

describe('POST /login', function(){
    it('it responds with 401 status code if bad username or password', function(done) {
        request(server)
            .post('/authenticate')
            .type('json')
            .send('{"username":"bad","password":"wrong"}')
            .expect(401)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('it responds with 200 status code if good username or password', function(done) {
        request(server)
            .post('/users/authenticate')
            .type('json')
            .send('{"username":"trof","password":"private"}')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('it returns JWT token if good username or password', function(done) {
        request(server)
            .post('/users/authenticate')
            .type('json')
            .send('{"username":"trof","password":"private"}')
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).have.property('token');
                done();
            });
    });
});