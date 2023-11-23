const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../config.js');
const CartModel = require('../daos/mongodb/models/cart.model');
const ProductModel = require('../daos/mongodb/models/product.model');
const { connectToDatabase, disconnectFromDatabase } = require('../daos/mongodb/connection.js')


describe('Cart API Tests', () => {
    let testCartId;

    const newCart = {
        products: [
            {
                product: '64c843097765c9849920b430',
                quantity: 2,
            },
            {
                product: '64c843097765c9849920b431',
                quantity: 1,
            }
        ]
    };

    before(async () => {
        connectToDatabase();

        // Create a test cart before running tests
        try {
            const createdCart = await CartModel.create(newCart);
            testCartId = createdCart._id;
        } catch (error) {
            console.error('Error creating a test cart:', error);
        }
    });


    it('should get all carts', (done) => {
        request(app)
            .get('/api/carts')
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should create a new cart', (done) => {
        const newCart = {
            products: [
                {
                    product: '64c843097765c9849920b430',
                    quantity: 2,
                },
                {
                    product: '64c843097765c9849920b431',
                    quantity: 1,
                },
            ],

        };

        request(app)
            .post('/api/carts')
            .send(newCart)
            .expect(201)
            .end((err, res) => {
                expect(res.body).to.have.property('_id');
                done();
            });
    });

    it('should add a product to a cart', (done) => {
        const productId = '64c843097765c9849920b430';
        const quantity = 1;

        request(app)
            .post(`/api/carts/${testCartId}/add/${productId}`)
            .send({ quantity })
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.property('message', 'Product added/updated in the cart successfully');
                done();
            });
    });

    it('should update a cart', (done) => {
        const updatedCart = {
            products: [
                {
                    product: '64c843097765c9849920b430',
                    quantity: 1,
                },
                {
                    product: '64c843097765c9849920b431',
                    quantity: 1,
                },
            ],
        };

        request(app)
            .put(`/api/carts/${testCartId}`)
            .send(updatedCart)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.property('_id', testCartId);
                done();
            });
    });

    it('should delete a product from a cart', (done) => {
        const productId = '64c843097765c9849920b431';

        request(app)
            .delete(`/api/carts/${testCartId}/remove/${productId}`)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.property('message', 'Product removed from cart successfully');
                done();
            });
    });

    it('should empty a cart', (done) => {
        request(app)
            .delete(`/api/carts/${testCartId}/empty`)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.property('message', 'All products removed from cart successfully');
                done();
            });
    });

    it('should purchase products from a cart', (done) => {
        // Define a valid cart ID for the purchase
        const cartId = testCartId;

        request(app)
            .post(`/api/carts/${cartId}/purchase`)
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.property('message', 'Purchase completed successfully');
                expect(res.body).to.have.property('ticket');
                done();
            });
    });

    after(async () => {
        disconnectFromDatabase();
    });

});
