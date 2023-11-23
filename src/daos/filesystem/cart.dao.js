const fs = require('fs').promises;
const path = require('path');
const shortid = require('shortid');
const mongoose = require('mongoose'); // Import Mongoose for ObjectId

const CARTS_DATA_PATH = path.join(__dirname, './data/carts.json');

// Helper function to read cart data from a file
const readCartData = async () => {
    try {
        const cartData = await fs.readFile(CARTS_DATA_PATH, 'utf8');
        return JSON.parse(cartData);
    } catch (error) {
        console.error('Error reading cart data:', error);
        return [];
    }
};

// Helper function to write cart data to a file
const writeCartData = async (data) => {
    try {
        await fs.writeFile(CARTS_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing cart data:', error);
    }
};

// Retrieve all carts
const getAll = async (req, res) => {
    try {
        const allCarts = await readCartData();
        res.json(allCarts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add a new cart
const create = async (req, res) => {
    try {
        const newCart = req.body;
        newCart.id = shortid.generate();

        // Read existing cart data
        const cartData = await readCartData();

        // Add the new cart to the data
        cartData.push(newCart);

        // Write the updated cart data back to the file
        await writeCartData(cartData);

        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Retrieve a cart by ID
const getById = async (req, res) => {
    try {
        const { cartId } = req.params;

        // Read existing cart data
        const cartData = await readCartData();

        // Find the cart by ID in the data
        const cart = cartData.find((cart) => cart.id === cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const cartProducts = cart.products;
        res.render('cart', { cart, username: req.session.username, cartProducts, cartId });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add a product to a cart
const addToCart = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        let { quantity } = req.body;
        quantity = parseInt(quantity);

        // Read existing cart data
        const cartData = await readCartData();

        // Find the cart by ID in the data
        const cart = cartData.find((cart) => cart.id === cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Your logic to add/update products in the cart data
        // Modify cart.products based on productId and quantity

        // Write the updated cart data back to the file
        await writeCartData(cartData);

        res.json({ message: 'Product added/updated in the cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
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
