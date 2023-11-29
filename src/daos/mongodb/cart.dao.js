const mongoose = require('mongoose');
const shortid = require('shortid');
const CartModel = require('../mongodb/models/cart.model');

// Retrieve all carts
const getAll = async () => {
    try {
        const allCarts = await CartModel.find();
        return allCarts;
    } catch (error) {
        throw error;
    }
};

// Add a new cart
const create = async (newCart) => {
    try {
        newCart.id = shortid.generate();
        const createdCart = await CartModel.create(newCart);
        return createdCart;
    } catch (error) {
        throw error;
    }
};

// Retrieve a cart by ID
const getById = async (cartId) => {
    try {
        const cart = await CartModel.findById(cartId).populate('products.product');
        return cart;
    } catch (error) {
        throw error;
    }
};

// Add a product to a cart
const addToCart = async (cartId, productId, quantity) => {
    try {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error('Cart not found');
        }

        // Your logic to add/update products in the cart
        // Modify cart.products based on productId and quantity

        // Save the updated cart
        await cart.save();
    } catch (error) {
        throw error;
    }
};

// Implement similar functions for other CRUD operations

module.exports = {
    getAll,
    create,
    getById,
    addToCart,
    // Implement other CRUD functions
};
