const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Add this line to use the path module
const wmProgramRouter = require('./routers/post');

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Use your routers here
app.use('/energymanagement', wmProgramRouter);

// Your other app setup, like error handling

// Serve the HTML page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;