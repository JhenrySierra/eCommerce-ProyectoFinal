const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartModel = require('./cart.model')

const userSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    cart: { type: Schema.Types.ObjectId, ref: CartModel },
    role: { type: String, default: "user" },
    last_connection: { type: Date },
    documents: [
        {
            name: { type: String },
            reference: { type: String },
            folder: { type: String } // To store the folder where the document is saved
        }
    ]
});

const User = mongoose.model('users', userSchema);

module.exports = User;
