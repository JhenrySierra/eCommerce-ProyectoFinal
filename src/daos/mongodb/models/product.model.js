const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const validator = require('validator');



const productSchema = new mongoose.Schema({
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    stock: { type: Number, required: true },
    id: { type: Number, required: true },
    owner: { type: String, default: 'admin'}

});

productSchema.plugin(mongoosePaginate)

const ProductModel = mongoose.model('products', productSchema);

module.exports = ProductModel;
