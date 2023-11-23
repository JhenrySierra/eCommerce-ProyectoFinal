const express = require('express');
const app = require('../config.js');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
require('dotenv').config();


// Middleware for sessions
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());