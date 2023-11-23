const express = require('express');
const router = express.Router();
const controller = require('../controllers/carts.controllers.js');

router
    .get('/', controller.getAll)
    .post('/', controller.create)
    .get('/:cartId', controller.getById)
    .post('/:cartId/products/:productId', controller.addToCart)
    .put('/:cartId', controller.update)
    .delete('/:cartId/products/:productId', controller.deleteFromCart)
    .delete('/:cartId', controller.emptyCart)
    .post('/:cid/purchase', controller.purchase)

module.exports = router;
