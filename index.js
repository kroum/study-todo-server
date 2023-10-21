"use strict";
import express from "express";
import cookieParser from "cookie-parser";

import  swaggerJSDoc from "swagger-jsdoc";
import  swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Simple todo API',
        version: '1.0.0',
    },
};
const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);

const PORT = 4000;
const app = express();

app.use(cookieParser());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((error, req, res, next) => { // Express error handler (Always should be the last one !)
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
})

app.get("/", (req, res) => res.status(200).json({status: "OK"}))
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
