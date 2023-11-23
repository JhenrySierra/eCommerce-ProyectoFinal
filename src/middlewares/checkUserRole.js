// Custom middleware to check user role
const checkUserRole = (req, res, next) => {
    // Assuming you have a way to identify the user's role, e.g., from a user object in the request
    const userRole = req.user && req.user.role; // Assuming the user's role is stored in req.user.role

    // Check if the user has the 'admin' role
    if (userRole === 'admin') {
        // If the user is an admin, allow them to proceed
        next();
    } else {
        // If the user is not an admin, return a 403 Forbidden response
        res.status(403).json({ error: 'Access denied. Only admin users are allowed.' });
    }
};

module.exports = checkUserRole;
