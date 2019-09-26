'use strict';

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

app.listen(3000, () => console.log('[ChatBot] Webhook is listening'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
