const http = require('http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const hotelsRouter = require('./routes/hotel/hotel');
const usersRouter = require('./routes/user/user');

const {PORT, DB_URI, resError} = require('./consts');

function startService(){
  mongoose.connect(DB_URI,{ 
    useCreateIndex: true,
    useNewUrlParser: true }, (err) => {
    console.log("connected to mongoDB");
  });

  app.use(express.static("."));
  app.use(bodyParser.json());         // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  app.use(bodyParser.raw());

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
  });

  app.use('/hotels', hotelsRouter);
  app.use('/users', usersRouter);  

  app.all('/*', function(req, res) {
      return resError(res, "404 not found");
  });

  http.createServer(app).listen(PORT);
  console.log(`Listening on port ${PORT}`);
}

module.exports = {
  startService
}
