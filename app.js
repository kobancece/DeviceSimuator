require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const wmProgramRouter = require('./routers/post');

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public')));

app.use('/energymanagement', wmProgramRouter);

// Serve the HTML page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;