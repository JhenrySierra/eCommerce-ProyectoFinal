const ProductDaoMongoDB = require("../daos/mongodb/product.dao.js");
const prodDao = new ProductDaoMongoDB();
const { QueryOptions } = require("mongoose-paginate-v2");
const logger = require('../middlewares/logger.js')


const getAll = async (options) => {
    try {
        const { limit = 10, page = 1, sort = { price: 1 }, query } = options;

        const queryOptions = {
            limit: limit,
            page: page,
            sort: sort,
        };

        if (query) {
            queryOptions.query = { title: { $regex: query, $options: "i" } };
        }

        const { docs: products, totalDocs: totalProducts, totalPages } =
            await prodDao.getAll(queryOptions);

        return { payload: products, totalProducts, totalPages }; 
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

const getById = async (id) => {
    try {
        const item = await prodDao.getById(id);
        if (!item) return false;
        else return item;
    } catch (error) {
        logger.error(error);
    }
}

const create = async (obj) => {
    try {
        const newProd = await prodDao.create(obj);
        if (!newProd) return false;
        else return newProd;
    } catch (error) {
        logger.error(error);
    }
}

const update = async (id, obj) => {
    try {
        const item = await prodDao.update(id, obj);
        return item;
    } catch (error) {
        logger.error(error);
    }
}

const remove = async (id) => {
    try {
        const item = await prodDao.delete(id);
        return item;
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
