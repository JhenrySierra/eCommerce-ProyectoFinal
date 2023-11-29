const express = require('express'); 
require('./config.js')
const logger = require('./middlewares/logger.js');
const app = require('./config.js');


require('./middlewares/session.js')
require('./routes/main.routes')
require('./docs/docs.config.js')
require('./daos/mongodb/connection.js');
require('dotenv').config();

const port = process.env.PORT;

app.listen(port, () => {
    logger.info(`🚀 Server listening on port ${port}`);
});