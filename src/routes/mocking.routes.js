const express = require('express');
const router = express.Router();
const { generateMockProducts } = require('../controllers/mocking.controllers.js');

// Define a route for mocking products
router.get('/mockingproducts', (req, res) => {
    try {
        // Generate mock product data
        const mockProductsData = generateMockProducts();

        res.status(200).json(mockProductsData);
    } catch (error) {
        console.error('Error generating mock products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
