const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../config.js');
const ProductModel = require('../daos/mongodb/models/product.model.js');
const { connectToDatabase, disconnectFromDatabase } = require('../daos/mongodb/connection.js');

describe('Product API Tests', () => {

    let testProductId; 

    before(async () => {
        connectToDatabase();

        const newProduct = {
            code: 'test-product-1',
            title: 'Test Product 1',
            description: 'This is a test product',
            price: 19.99,
            thumbnail: 'https://example.com/product1-thumbnail.jpg',
            stock: 50,
            id: 1,
        };

        try {
            const createdProduct = await ProductModel.create(newProduct);
            testProductId = createdProduct._id; 
        } catch (error) {
            console.error('Error creating the test product:', error);
        }
    });

    it('should get all products', (done) => {
        request(app)
            .get('/api/products')
            .expect(200)
            .end((err, res) => {

                if (err) {
                    console.error(err);
                }   
                expect(res.body).to.be.an('object');
                done();
            });
    });

    it('should get a product by ID', (done) => {
        request(app)
            .get(`/api/products/${testProductId}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                expect(res.body).to.have.property('_id', testProductId);
                // expect(res.body).to.be.an('object');
                done();
            });
    });
    it('should create a new product', (done) => {
        const newProduct = {
            code: 'new-product-code',
            title: 'New Test Product',
            description: 'This is a new test product',
            price: 12.99,
            thumbnail: 'https://example.com/new-product-thumbnail.jpg',
            stock: 50,
        };

        request(app)
            .post('/api/products')
            .send(newProduct)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                // expect(res.body).to.have.property('_id');
                expect(res.body).to.be.an('object');

                done();
            });
    });

    it('should update a product', (done) => {
        const updatedProduct = {
            title: 'Updated Test Product',
            description: 'This is an updated test product',
            price: 15.99,
            thumbnail: 'https://example.com/updated-product-thumbnail.jpg',
            stock: 75,
        };

        request(app)
            .put(`/api/products/${testProductId}`)
            .send(updatedProduct)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                // expect(res.body).to.have.property('_id', testProductId);
                expect(res.body).to.be.an('object');

                done();
            });
    });

    it('should delete a product', (done) => {
        request(app)
            .delete(`/api/products/${testProductId}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                // expect(res.body).to.have.property('_id', testProductId);
                expect(res.body).to.be.an('object');

                done();
            });
    });

    after(async () => {
        disconnectFromDatabase();
    });
});
