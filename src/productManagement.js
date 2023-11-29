const fs = require('fs');
const path = require('path');
const logger = require('../../middlewares/logger')

class ProductManager {
    constructor() {
        this.products = [];
        this.carts = [];
        this.lastProductId = 0;
        this.lastCartId = 0;
        this.productsPath = path.join(__dirname, 'products.json');
        this.cartsPath = path.join(__dirname, 'carts.json');
        this.loadProducts();
        this.loadCarts();
    }

    loadProducts() {
        try {
            const productsData = fs.readFileSync(this.productsPath, 'utf8');
            this.products = JSON.parse(productsData) || [];
            this.lastProductId = this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
        } catch (error) {
            logger.error('Error loading products:', error);
        }
    }

    saveProducts() {
        try {
            fs.writeFileSync(this.productsPath, JSON.stringify(this.products, null, 2));
        } catch (error) {
            logger.error('Error saving products:', error);
        }
    }


    loadCarts() {
        try {
            const cartsData = fs.readFileSync(this.cartsPath, 'utf8');
            this.carts = JSON.parse(cartsData) || [];
            this.lastCartId = this.carts.length > 0 ? this.carts[this.carts.length - 1].id : 0;
        } catch (error) {
            logger.error('Error loading carts:', error);
        }
    }

    saveCarts() {
        try {
            fs.writeFileSync(this.cartsPath, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            logger.error('Error saving carts:', error);
        }
    }

    getProducts() {
        return this.products;
    }

    getProductById(productId) {
        return this.products.find((product) => product.id === productId);
    }

    addProduct(product) {
        this.lastProductId++;
        product.id = this.lastProductId;
        this.products.push(product);
        this.saveProducts();
    }

    

    updateProduct(productId, updatedFields) {
        const product = this.getProductById(productId);

        if (product) {
            Object.assign(product, updatedFields);
            this.saveProducts();
        }
    }

    deleteProduct(productId) {
        const productIndex = this.products.findIndex((product) => product.id === Number(productId));

        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.saveProducts();
            return true; // Return true to indicate successful deletion
        }

        return false; // Return false to indicate product not found
    }

    createCart(cart) {
        this.lastCartId++;
        cart.id = this.lastCartId;
        cart.products = [];
        this.carts.push(cart);
        this.saveCarts();
    }

    getAllCarts() {
        return this.carts;
    }

    getCartById(cartId) {
        return this.carts.find((cart) => cart.id === cartId);
    }

    addProductToCart(cartId, productId) {
        const cart = this.getCartById(cartId);
        const product = this.getProductById(parseInt(productId));

        if (cart && product) {
            const existingProduct = cart.products.find((p) => p.id === productId);

            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                const newProduct = { id: product.id, name: product.name, quantity: 1 };
                cart.products.push(newProduct);
            }

            this.saveCarts();
        }
    }
}

module.exports = ProductManager;
