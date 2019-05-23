const chai = require('chai');
const assert = chai.assert;
const fs = require('fs');
const path = require('path');
const url = require('url');

const should = require('should'),
 supertest = require('supertest');
const request = supertest('localhost:3000');

let postedImageURL = ''


// test
describe('Web API response For POST endpoint', function() {
    this.timeout(10000); 

	// check if post endpoint responce correctly
	it('check if post endpoint work correctly (positive testing)', function(done) {
        request.post('/image')
        .attach('image', fs.createReadStream('./testfile/test3.jpg'))
        .expect((res) => {
            res.status.should.equal(201)
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('message', 'thumbnailURL');
            res.body.message.should.equal('Image upload successfully');
            let postedURL = url.parse(res.body.thumbnailURL);
            postedImageURL = postedURL.pathname;

        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });

    it('send jpeg file (positive testing)', function(done) {
        request.post('/image')
        .attach('image', fs.createReadStream('./testfile/test1.jpeg'))
        .expect((res) => {
            res.status.should.equal(201)
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('message', 'thumbnailURL');
            res.body.message.should.equal('Image upload successfully');
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });

    it('send png file (positive testing)', function(done) {
        request.post('/image')
        .attach('image', fs.createReadStream('./testfile/test2.png'))
        .expect((res) => {
            res.status.should.equal(201)
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('message', 'thumbnailURL');
            res.body.message.should.equal('Image upload successfully');
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });

    // send non-existing url
    it('send non-existing url,return 404(negative testing)', function(done) {
        request.post('/imageWrongplace')
        .attach('image', fs.createReadStream('./testfile/test3.jpg'))
        .expect((res) => {
            res.status.should.equal(404)
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('error');
            res.body.error.message.should.equal('Not Found');
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });

    //send non image file
    it('send non image file,return 400(negative testing)', function(done) {
        request.post('/image')
        .attach('image', fs.createReadStream('./testfile/test_wrongfile.txt'))
        .expect((res) => {
            res.status.should.equal(400);
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('error');
            res.body.error.should.equal('File type is not acceptable');
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });
    
    //send wrong parametere
    it('send wrong parameter,return 500(negative testing)', function(done) {
        request.post('/image')
        .attach('dmage', fs.createReadStream('./testfile/test3.jpg'))
        .expect((res) => {
            res.status.should.equal(500);
            res.type.should.equal("application/json");
            res.body.should.have.only.keys('error');
            res.body.error.message.should.equal('Unexpected field');
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });
});


// get
describe('Web API response For GET endpoint', function() {
    this.timeout(10000); 
	// check if GET endpoint responce correctly
	it('check if get endpoint work correctly (positive testing)', function(done) {
        
        request.get(postedImageURL)
        .expect((res) => {
            res.status.should.equal(200);
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });

    //send request with non-existsing imageId of parameter
    it('send request with non-existsing imageId of parameter', function(done) {
        const randomPath = '/image/asdfasdfasdfa/thumnail'
        request.get(randomPath)
        .expect((res) => {
            res.status.should.equal(404);
        }).end((err,res) =>{
            if(err){
                throw err;
            }
            done();
        })
    });
});
