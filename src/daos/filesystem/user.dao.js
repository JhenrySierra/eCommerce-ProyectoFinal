const fs = require('fs').promises;
const path = require('path');
const CartModel = require('../mongodb/models/cart.model');
const { mapUserToDTO } = require('../../dto/user.db.dto');
const { sendUserResponse } = require('../../dto/user.dto.res');
const bcrypt = require('bcrypt');


class UserDaoFS {
    constructor() {
        this.USERS_DATA_PATH = path.join(__dirname, '../data/users.json');
    }

    async getUsers() {
        try {
            const userData = await fs.readFile(this.USERS_DATA_PATH, 'utf8');
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error reading user data:', error);
            return [];
        }
    }

    async saveUsers(users) {
        try {
            await fs.writeFile(this.USERS_DATA_PATH, JSON.stringify(users, null, 2), 'utf8');
        } catch (error) {
            console.error('Error writing user data:', error);
        }
    }

    async findByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email) || null;
    }

    async findById(id) {
        const users = await this.getUsers();
        return users.find(user => user._id === id) || null;
    }

    async create(newUser) {
        try {
            const { first_name, last_name, username, email, age, password } = newUser;

            const hashedPassword = await bcrypt.hash(password, 10);

            const newCart = new CartModel();
            await newCart.save();

            const createdUser = {
                _id: newCart._id, // Replace with a unique user ID generation method
                first_name,
                last_name,
                username,
                email,
                age,
                password: hashedPassword,
                role: 'user',
                cart: newCart._id,
            };

            const users = await this.getUsers();
            users.push(createdUser);

            await this.saveUsers(users);

            return createdUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async update(updatedUser) {
        try {
            const { _id, first_name, last_name, username, age } = updatedUser;

            const users = await this.getUsers();
            const existingUserIndex = users.findIndex(user => user._id === _id);

            if (existingUserIndex !== -1) {
                users[existingUserIndex] = {
                    ...users[existingUserIndex],
                    first_name,
                    last_name,
                    username,
                    age,
                };

                await this.saveUsers(users);

                return users[existingUserIndex];
            }

            return null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
}

module.exports = UserDaoFS;
