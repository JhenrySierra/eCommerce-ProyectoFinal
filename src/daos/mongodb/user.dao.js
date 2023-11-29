const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user.model');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const GitHubStrategy = require('passport-github2').Strategy;
const { mapUserToDTO } = require('../../dto/user.db.dto');
const { sendUserResponse } = require('../../dto/user.dto.res');
require('dotenv').config();
const CartModel = require('./models/cart.model');

const router = express.Router();

class UserDaoMongo {
    constructor() {
        this.initPassport();
    }

    initPassport() {
        // Set up Passport Local strategy
        passport.use(new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email });

                    if (!user) {
                        return done(null, false, { message: 'Invalid email' });
                    }

                    const isPasswordValid = await bcrypt.compare(password, user.password);

                    if (!isPasswordValid) {
                        return done(null, false, { message: 'Invalid password.' });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await User.findById(id);
                done(null, user);
            } catch (err) {
                done(err);
            }
        });

        // Passport Github strategy
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/auth/github/callback"
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await User.findOne({ email: profile.emails[0].value });

                    if (existingUser) {
                        return done(null, existingUser);
                    }

                    const newUser = new User({
                        email: profile.emails[0].value || 'default@example.com',
                        username: profile.username || 'defaultUsername',
                        password: 'defaultPassword',
                        first_name: 'Default',
                        last_name: 'User',
                        age: 0,
                        role: 'user',
                        cart: new CartModel()
                    });

                    await newUser.save();
                    return done(null, newUser);
                } catch (err) {
                    return done(err);
                }
            }));

        router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

        // GitHub callback route
        router.get('/github/callback',
            passport.authenticate('github', { failureRedirect: '/login' }),
            (req, res) => {
                res.redirect('/products');
            }
        );
    }

    registerView(req, res) {
        res.render('register', {});
    }

    loginView(req, res) {
        res.render('login', {});
    }

    async register(req, res) {
        try {
            const { first_name, last_name, username, email, age, password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const newCart = new CartModel();
            await newCart.save();

            const newUser = new User({
                first_name,
                last_name,
                username,
                email,
                age,
                password: hashedPassword,
                role: 'user',
                cart: newCart._id
            });

            await newUser.save();
            res.status(201).send('User registered successfully!');
        } catch (err) {
            console.error(err);
            res.status(400).send('Error registering user: ' + err.message);
        }
    }

    async current(req, res) {
        try {
            const currentUser = await User.findById(req.user._id).populate('cart');

            if (!currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userDTO = mapUserToDTO(currentUser);
            sendUserResponse(res, userDTO);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching current user' });
        }
    }

    logout(req, res) {
        req.logout(() => {
            res.redirect('/auth/login');
        });
    }
}

module.exports = UserDaoMongo;
