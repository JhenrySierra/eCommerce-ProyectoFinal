const service = require("../services/product.services.js");
const path = require('path');
const exphbs = require('express-handlebars');

const getAll = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: limit ? parseInt(limit) : 10,
            page: page ? parseInt(page) : 1,
            sort: sort === 'desc' ? 'desc' : 'asc',
            query: query || undefined,
        };
        const result = await service.getAll(options);

        const responseData = {
            status: 'success',
            payload: result.payload,
            totalPages: result.totalPages,
            prevPage: options.page > 1 ? options.page - 1 : null,
            nextPage: options.page < result.totalPages ? options.page + 1 : null,
            page: options.page,
            hasPrevPage: options.page > 1,
            hasNextPage: options.page < result.totalPages,
            prevLink: options.page > 1 ? `/products?limit=${options.limit}&page=${options.page - 1}` : null,
            nextLink: options.page < result.totalPages ? `/products?limit=${options.limit}&page=${options.page + 1}` : null,
            username: req.user ? req.user.first_name || "API" : "API",
            role: req.user ? req.user.role : "API_ROLE", // Provide a default value if req.user is undefined
            cartId: req.user ? req.user.cart : null, // Provide a default value or handle accordingly
        };
        return responseData; // Return the data for HTML rendering
    } catch (error) {
        next(error);
    }
};


const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prod = await service.getById(id);
        if (!prod) res.status(404).json({ msg: "Product not found!" });
        else res.json(prod);
    } catch (error) {
        next(error.message);
    }
};

const create = async (req, res, next) => {
    try {
        const { name, price, description, stock } = req.body;
        // Add the owner field to the request body
        const newProd = await service.create({
            ...req.body,
            owner: req.user ? req.user._id : 'admin',
        });
        if (!newProd) res.status(404).json({ msg: "Validation Error!" });
        else res.json(newProd);
    } catch (error) {
        next(error.message);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prodUpd = await service.update(id, req.body);
        res.json(prodUpd);
    } catch (error) {
        next(error.message);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Check if the user is an admin
        if (user.role === 'admin') {
            // If the user is an admin, allow them to delete any product
            const prodDel = await service.remove(id);
            return res.json(prodDel);
        }

        // Check if the user has a premium role and is the owner of the product
        const product = await service.getById(id);
        if (!product || (user.role === 'premium' && product.owner === user._id.toString())) {
            const prodDel = await service.remove(id);
            return res.json(prodDel);
        }

        // If the user does not have the necessary permissions, return a 403 Forbidden response
        return res.status(403).json({ msg: 'You do not have permission to delete this product.' });
    } catch (error) {
        next(error.message);
    }
};



module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
