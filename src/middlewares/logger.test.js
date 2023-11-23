// logger.test.js

const express = require('express');
const logger = require('./logger');

const router = express.Router();

router.get('/loggerTest', (req, res) => {
    logger.debug('This is a debug message.');
    logger.http('This is an http message.');
    logger.info('This is an info message.');
    logger.warning('This is a warning message.');
    logger.error('This is an error message.');
    logger.fatal('This is a fatal message.');

    res.send('Logs have been generated. Check the console and log file.');
});

module.exports = router;