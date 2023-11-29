const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../config.js');
require('dotenv').config();
const User = require('../daos/mongodb/models/user.model');
const CartModel = require('../daos/mongodb/models/cart.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase, disconnectFromDatabase } = require('../daos/mongodb/connection.js');
require('dotenv').config();

describe('User API Tests', function () { 

    this.timeout(5000); 

    let testUserId;
    let testUserToken;

    before(async function () { 

        connectToDatabase();

        const testCart = new CartModel();
        await testCart.save();

        const hashedPassword = await bcrypt.hash('testPassword', 10);

        const newUser = new User({
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            email: 'testuser@example.com',
            age: 25,
            password: hashedPassword,
            role: 'user',
            cart: testCart._id,
        });

        await newUser.save();

        testUserToken = jwt.sign({ user: newUser }, process.env.SECRET_KEY);
        testUserId = newUser._id;
    });

    it('should register a new user', function (done) { 
        const newUser = {
            first_name: 'New',
            last_name: 'User',
            username: 'newuser',
            email: 'newuser@example.com',
            age: 30,
            password: 'newPassword',
        };

        request(app)
            .post('/auth/register')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                expect(res.body).to.deep.include('message', 'User registered successfully');
                done();
            });
    });

    it('should log in a user', function (done) {
        const loginCredentials = {
            email: 'testuser@example.com',
            password: 'testPassword',
        };

        request(app)
            .post('/auth/login')
            .send(loginCredentials)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.deep.include('message', 'Login successful');
                done();
            });
    });

    it('should send a password reset email', function (done) { // Using a regular function
        const resetRequest = {
            email: 'testuser@example.com',
        };

        request(app)
            .post('/auth/forgotPassword')
            .send(resetRequest)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.deep.include('message', 'Password reset email sent successfully');
                done();
            });
    });

    it('should update the user password', function (done) { // Using a regular function
        const newPassword = {
            password: 'newPassword',
            confirmPassword: 'newPassword',
        };

        const token = jwt.sign({ user: { _id: testUserId } }, process.env.SECRET_KEY);

        request(app)
            .put('/auth/update-password')
            .set('Authorization', `Bearer ${token}`)
            .send(newPassword)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.deep.include('message', 'Password reset successfully');
                done();
            });
    });

    it('should get the current user', function (done) { // Using a regular function
        request(app)
            .get('/auth/current')
            .set('Authorization', `Bearer ${testUserToken}`)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.deep.include({ first_name: 'Test' });
                done();
            });
    });

    after(async function () { // Using a regular function
        disconnectFromDatabase();
    });
});
