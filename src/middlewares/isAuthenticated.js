const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        // User is authenticated, continue to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, redirect to the login page
        return res.redirect('/auth/login');
    }
};

module.exports = isAuthenticated;
