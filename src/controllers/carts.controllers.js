const express = require('express');
const router = express.Router();
const CartModel = require('../daos/mongodb/models/cart.model');
const mongoose = require('mongoose');
const ProductModel = require('../daos/mongodb/models/product.model');
const shortid = require('shortid');
const logger = require('../middlewares/logger')

const Ticket = require('../daos/mongodb/models/ticket.model'); 

// Retrieve all carts
const getAll = async (req, res) => {
    try {
        const allCarts = await CartModel.find();
        res.json(allCarts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Add a new cart
const create = async (req, res) => {
    try {
        const newCart = req.body;
        const createdCart = await CartModel.create(newCart);
        res.status(201).json(createdCart);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Retrieve a cart by ID
const getById = async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await CartModel.findById(cartId).populate('products.product');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const cartProducts = cart.products;
        res.render('cart', { cart, username: req.session.username, cartProducts, cartId })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Add a product to a cart
const addToCart = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        let { quantity } = req.body;
        quantity = parseInt(quantity);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity. Must be a positive integer' });
        }

        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the user is premium and owns the product
        const user = req.user;
        if (user.role === 'premium' && product.owner === user._id.toString()) {
            return res.status(403).json({ error: 'Premium users cannot add their own products to the cart' });
        }

        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

        if (productIndex === -1) {
            cart.products.push({ product: productId, quantity });
        } else {
            cart.products[productIndex].quantity = quantity;
        }

        // Save the updated cart
        await cart.save();
        res.json({ message: 'Product added/updated in the cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// Update a cart
const update = async (req, res) => {
    try {
        const { cartId } = req.params;
        const updatedCart = req.body;
        const cart = await CartModel.findByIdAndUpdate(cartId, updatedCart, { new: true });
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete a product from a cart
const deleteFromCart = async (req, res) => {
    try {
        const { cartId, productId } = req.params;

        // Find the cart by its ID
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find the product in the cart by its ID
        const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in the cart' });
        }

        // Remove the product from the cart
        cart.products.splice(productIndex, 1);

        await cart.save();
        res.json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete all products from the cart
const emptyCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.products = [];

        await cart.save();
        res.json({ message: 'All products removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Generate a unique ticket code for purchase tracking
const generateUniqueTicketCode = async () => {
    let code;
    do {
        code = shortid.generate();
    } while (await Ticket.findOne({ code }));
    return code;
};



// Create and save a new ticket
const createTicket = async (amount, purchaserEmail) => {
    try {

        logger.info('Creating ticket with amount:', amount);

        // Ensure 'amount' is a valid number
        if (isNaN(amount)) {
            throw new Error('Invalid amount value');
        }

        const code = await generateUniqueTicketCode();
        const ticket = new Ticket({
            code,
            amount,
            purchaser: purchaserEmail
        });
        await ticket.save();
        return ticket;
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
};

const purchase = async (req, res) => {
    try {
        const purchaserEmail = req.user.email;
        const { cid } = req.params; 
        const cart = await CartModel.findById(cid).populate('products.product');

        const calculateTotalAmount = (cart) => {
            let amount = 0;

            for (const item of cart.products) {
                const productPrice = item.product.price; 
                const quantity = item.quantity;
                amount += productPrice * quantity;
            }

            return amount;
        };

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const errors = [];

        // Calculate the total amount of the purchase
        const totalAmount = calculateTotalAmount(cart);

        // Create a single ticket for the entire purchase
        try {
            const ticket = await createTicket(totalAmount, purchaserEmail);

            // Deduct stock from available products
            for (const item of cart.products) {
                const product = item.product;
                const quantity = item.quantity;

                // Update the stock for the product
                product.stock -= quantity;
                await product.save();
            }

            cart.products = [];
            await cart.save();

            res.json({ message: 'Purchase completed successfully', ticket });
        } catch (error) {
            errors.push(`Error creating ticket: ${error.message}`);
            res.status(500).json({ errors });
        }
    } catch (error) {
        console.error('Error finalizing purchase:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    getAll,
    create,
    getById,
    addToCart,
    update,
    deleteFromCart,
    emptyCart,
    purchase,
    generateUniqueTicketCode
};
