const express = require('express');
const passport = require('passport');
const controller = require('../controllers/users.controllers')
const isAuthenticated = require('../middlewares/isAuthenticated')
const upload = require('../middlewares/multer');
const nodemailer = require('nodemailer');
const checkUserRole = require('../middlewares/checkUserRole.js')
const User = require('../daos/mongodb/models/user.model.js')


const router = express.Router();

router
    .get('/register', controller.registerView)
    .get('/login', controller.loginView)
    .get('/forgotPassword', controller.forgotPasswordView)
    .get('/reset-password', controller.resetPassView)

    .post('/register', controller.register)
    .get('/current', controller.current)
    .get('/logout', controller.logout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/products',   
    failureRedirect: '/auth/login', 
    failureFlash: true
}));

router.post('/login', (req, res) => {
    req.session.username = req.user.username;
    req.session.role = req.user.role;
});


router.post('/reset-pass',  controller.resetPass);

router.post('/new-pass',  controller.updatePass);

// Update role
router.put('/premium/:uid/:newRole', async (req, res) => {
    const { uid, newRole } = req.params;

    try {
        const result = await controller.updateRole(uid, newRole);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Route to handle documents uploads

router.post('/:uid/documents', upload.array('documents'), async (req, res) => {
    try {
        const userId = req.params.uid;
        const documents = req.files.map(file => ({
            name: file.originalname,
            reference: file.filename,
            folder: req.body.folder || 'documents'
        }));

        // Update the user's documents array
        const user = await User.findByIdAndUpdate(userId, { $push: { documents } }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Documents uploaded successfully', user });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users', controller.getAllUsers)

// Route to view, modify, and delete users
router.get('/admin/users', checkUserRole, async (req, res) => {
    try {
        // Fetch users from the database
        const users = await User.find();
        res.render('adminUsersView', { users }); // Render your HTML view and pass the user data
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/inactiveUsers', controller.findInactiveUsers)

router.get('/admin/users/:id/edit', checkUserRole, async (req, res) => {
    try {
        // Fetch the user based on the provided ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('editUser', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle form submission for editing users
router.post('/admin/users/:id/edit', checkUserRole, async (req, res) => {
    try {
        // Fetch the user based on the provided ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user information based on the form data
        user.username = req.body.username;
        user.email = req.body.email;
        user.role = req.body.role;

        // Save the updated user
        await user.save();

        res.redirect('/admin/users'); // Redirect to the user list page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
