const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../daos/mongodb/models/user.model');
const isAuthenticated = require('../middlewares/isAuthenticated');
const GitHubStrategy = require('passport-github2').Strategy;
const { mapUserToDTO } = require('../dto/user.db.dto');
const { sendUserResponse } = require('../dto/user.dto.res');
require('dotenv').config();
const CartModel = require('../daos/mongodb/models/cart.model');
const resetSecret = process.env.SECRET_RESET;
const { sendPasswordResetEmail } = require('../services/mailer.js')
const { transporter } = require('../services/mailer.js')
require('../services/mailer.js')
const logger = require('../middlewares/logger.js');
const { error } = require('winston');

const router = express.Router();

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

            // Update last_connection on successful login
            user.last_connection = new Date();
            await user.save();


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

//Passport Github strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback" // Use  callback URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user exists in  database based on the GitHub email
            const existingUser = await User.findOne({ email: profile.emails[0].value });

            if (existingUser) {
                // If user exists, return the user
                return done(null, existingUser);
            }

            // If user doesn't exist, create a new user in  database
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
    }
));

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to a secure route or send a response
        res.redirect('/products');
    }
);
//----------------end github strategy-------------//

// Route to render the registration form view

const registerView = (req, res) => {
    res.render('register', {});
}

// Route to render the login form view

const loginView = (req, res) => {
    res.render('login', {});
};

const forgotPasswordView = (req, res) => {
    res.render('forgotPassword', {});
};

const resetPassView = (req, res) => {
    res.render('passwordReset', {});
};

// Route to handle user registration

const register = async (req, res) => {
    try {
        const { first_name, last_name, username, email, age, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCart = new CartModel();
        await newCart.save()


        const newUser = new User({
            first_name,
            last_name,
            username,
            email,
            age,
            password: hashedPassword,
            role: 'user', 
            cart: newCart._id, 

        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).send('Error registering user: ' + err.message);
    }
};


// Add the /current route

const current = async (req, res) => {
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
};

// Route to handle user logout
const logout = (req, res) => {
    req.logout(() => {
        
        res.redirect('/auth/login');
    });
};



// Function to generate a reset token and send a password reset email
const resetPass = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if the user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token with an expiration time (e.g., 1 hour)
        const token = jwt.sign({ email }, resetSecret, { expiresIn: '1h' });

        // Send a password reset email with the reset token
        sendPasswordResetEmail(email, token); // Implement this function

        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Error sending password reset email'});
    }
};

// Function to update the user's password using the reset token
const updatePass = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body; // Assuming password and confirmPassword are submitted in the request body
        const token = req.query.token; // Get the token from the query parameters

        try {
            // Verify the token with your secret
            const { email } = jwt.verify(token, resetSecret);

            // Find the user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password
            user.password = hashedPassword;
            await user.save();

            // Respond with a success message
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            logger.error(error)
            res.status(400).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
};

const updateRole = async (uid, newRole) => {
    try {
        // Validate the new role
        if (!['user', 'premium'].includes(newRole)) {
            throw new Error('Invalid role');
        }

        // Find the user by ID
        const user = await User.findById(uid);

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user is upgrading to "premium"
        if (newRole === 'premium') {
            // Check if the required documents are uploaded
            if (
                !user.documents ||
                !user.documents.some(doc => ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'].includes(doc.name))
            ) {
                throw new Error('User has not uploaded all required documents to upgrade to premium');
            }
        }

        // Update the user's role
        user.role = newRole;

        // Save the updated user
        await user.save();

        return { message: 'User role updated successfully', user };
    } catch (error) {
        console.error('Error updating user role:', error);
        throw new Error('Internal server error');
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { first_name: 1, last_name: 1, email: 1, role: 1 });
        const usersDTO = users.map(user => ({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role
        }));
        
        console.log(usersDTO);
        res.status(200).json(usersDTO);
    } catch (error) {
        next(error);
    }
};

const findInactiveUsers = async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const inactiveUsers = await User.find({ last_connection: { $lt: twoDaysAgo } });

        if (inactiveUsers.length > 0) {
            // Delete inactive users and send email notification
            await Promise.all(inactiveUsers.map(async (user) => {
                await User.findByIdAndDelete(user._id);

                // Send email notification to the user using the transporter from mailer.js
                await transporter.sendMail({
                    to: user.email,
                    subject: 'Account Deletion Notification',
                    text: 'Your account has been deleted due to inactivity. Please contact support for further assistance.',
                });

                console.log(`User ${user.username} deleted and notified.`);
            }));

            console.log('Deletion and notification process completed.');
        } else {
            console.log('No inactive users found.');
        }
    } catch (error) {
        console.error('Error during deletion and notification:', error);
    }
};

module.exports = {
    registerView,
    loginView,
    forgotPasswordView,
    resetPassView,
    register,
    current,
    logout,
    resetPass,
    updatePass,
    updateRole,
    getAllUsers,
    findInactiveUsers
};