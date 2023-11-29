const productRouter = require('./products.routes.js');
const cartRouter = require('./carts.routes.js');
const viewRouter = require('../views/views.routes.js');
const userRouter = require('./users.routes.js')
const mockingProducts = require('./mocking.routes.js')
const logger = require('../middlewares/logger.js');
const loggerTest = require('../middlewares/logger.test.js')
const isAuthenticated = require('../middlewares/isAuthenticated.js');
const express = require('express');
const app = require('../config.js');

app.get('/', (req, res) => {
    res.redirect('/products');
});
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/auth', userRouter);

app.use('/products', isAuthenticated, viewRouter);
app.use('/auth', userRouter)
app.use('/cart', cartRouter)

app.get('/mockingproducts', mockingProducts);
app.get('/loggerTest', loggerTest)