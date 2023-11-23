const express = require('express');
const app = require('../config.js');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')

// Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My eCommerce APIs',
            version: '1.0.0',
            description: 'This are the docs explaining the functionalities for my eCommerce APIs',
        },
    },
    servers: [
        {
            url: 'http://localhost:8080'  // Define the base URL of your API
        }
    ],
    // API routes to be documented
    apis: ['src/docs/*.yml'], // Add the paths to your route and documentation files here
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));