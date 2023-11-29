const fs = require('fs').promises; // Use fs.promises for async/await support
const path = require('path');
const shortid = require('shortid');

const PRODUCTS_DATA_PATH = path.join(__dirname, '../data/products');

class ProductDaoFS {
    // Helper function to read product data from a file
    static async readProductData(productId) {
        try {
            const productData = await fs.readFile(path.join(PRODUCTS_DATA_PATH, `${productId}.json`), 'utf8');
            return JSON.parse(productData);
        } catch (error) {
            console.error('Error reading product data:', error);
            return null;
        }
    }

    // Helper function to write product data to a file
    static async writeProductData(productId, data) {
        try {
            await fs.writeFile(path.join(PRODUCTS_DATA_PATH, `${productId}.json`), JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error writing product data:', error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const { limit = 10, page = 1, sort, query } = req.query;
            const options = {
                limit: limit ? parseInt(limit) : 10,
                page: page ? parseInt(page) : 1,
                sort: sort === 'desc' ? 'desc' : 'asc',
                query: query || undefined,
            };
            const result = await service.getAll(options);

            return {
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
            };
        } catch (error) {
            throw error;
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const productData = await ProductDaoFS.readProductData(id);

            if (!productData) {
                res.status(404).json({ msg: "Product not found!" });
            } else {
                res.json(productData);
            }
        } catch (error) {
            next(error.message);
        }
    }

    static async create(req, res, next) {
        try {
            const { name, price, description, stock } = req.body;
            const newProductData = {
                id: shortid.generate(),
                name,
                price,
                description,
                stock,
            };

            // Write the new product data to a file
            await ProductDaoFS.writeProductData(newProductData.id, newProductData);

            res.json(newProductData);
        } catch (error) {
            next(error.message);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProductData = {
                id,
                ...req.body,
            };

            // Write the updated product data to a file
            await ProductDaoFS.writeProductData(id, updatedProductData);

            res.json(updatedProductData);
        } catch (error) {
            next(error.message);
        }
    }

    static async remove(req, res, next) {
        try {
            const { id } = req.params;

            // Delete the product data file
            await fs.unlink(path.join(PRODUCTS_DATA_PATH, `${id}.json`));

            res.json({ message: 'Product removed successfully' });
        } catch (error) {
            next(error.message);
        }
    }
}

module.exports = ProductDaoFS;
