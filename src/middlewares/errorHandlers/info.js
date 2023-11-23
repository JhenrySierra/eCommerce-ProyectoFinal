const { EErrors } = require('./enums'); 

const errorInfo = {
    [EErrors.DATABASE_ERROR.code]: {
        name: 'Database Error',
        description: 'An error occurred while accessing the database.',
        action: 'Check the database connection and try again.',
        solution: 'Verify database credentials and ensure the database server is running.',
    },
    [EErrors.AUTHENTICATION_ERROR.code]: {
        name: 'Authentication Error',
        description: 'Authentication failed for the user.',
        action: 'Please check your username and password and try again.',
        solution: 'Reset your password or contact support for assistance.',
    },
};

module.exports = {
    errorInfo,
};
