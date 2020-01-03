require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URI || 'mongodb://localhost/exercise-track');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use('/public', express.static(process.cwd() + '/public'));
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'Not found'});
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // Mongoose validation error
    errCode = 400; // Bad request
    const keys = Object.keys(err.errors);
    // Report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // Generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage);
});

const portNum = process.env.PORT || 3000;

// Listen for requests
app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
});

module.exports = app; // For testing
