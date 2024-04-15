const express = require('express');
const bodyParser = require('body-parser');
const wmProgramRouter = require('./routers/post');

const app = express();

app.use(bodyParser.json()); // for parsing application/json

// Use your routers here
app.use('/energymanagement', wmProgramRouter);

// Your other app setup, like error handling

module.exports = app;
