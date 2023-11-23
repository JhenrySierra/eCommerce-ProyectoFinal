// Import necessary modules and files
const { MyCustomError } = require('./errorHandlers/CustomError');
const { EErrors } = require('./errorHandlers/enums');
const { errorInfo } = require('./errorHandlers/info');

// General error-handling middleware
function errorHandler(err, req, res, next) {
    // Default error status and message
    let status = 500; // Internal Server Error
    let message = 'Internal Server Error';

    if (err instanceof MyCustomError) {
        // Handle custom errors created using CustomError.js
        status = 400; // Bad Request
        message = err.message;
    } else if (err.code && EErrors[err.code]) {
        // Handle errors defined in EErrors.js (enums.js)
        const errorDetails = errorInfo[err.code];
        if (errorDetails) {
            // Use the error code and message from EErrors.js
            status = 400; // Bad Request
            message = errorDetails.message;
        }
    }

    // Log the error for debugging
    console.error(`Error Status ${status}: ${message}`);
    console.error(err);

    res.status(status).json({ error: message });
}

module.exports = errorHandler;
