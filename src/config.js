const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
const errorHandler = require('./middlewares/errorHandler.js');
app.use(errorHandler);
app.use(cors());


// Get the current module's directory
const currentModuleDir = __dirname;

// Set up Handlebars as the view engine
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(currentModuleDir, 'views'));

// Export the Express app if needed
module.exports = app;
