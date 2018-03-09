var express    = require('express');
var app        = express();
var port       = process.env.PORT || 8080;
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var pg         = require('pg');
var router     = express.Router();
var appRoutes  = require('./App/Routes/api.js')(router);
var path       = require('path');
var favicon    = require('serve-favicon');

// TRYING MONGOCLIENG
var mongoClient = require('mongodb').MongoClient;

app.use(morgan('dev')); // morgan logs web app requests
app.use(express.urlencoded()); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json
app.use(express.static(__dirname + '/Public'));
app.use(favicon(__dirname + '/Public/assests/images/favicon.ico'));
app.use('/api', appRoutes);

// Mongo db used to store user information
/*
mongoose.connect('mongodb://admin:password@localhost:27017/legalx_db?authSource=admin', function(err){
  if (err) {
    console.log('Not connected to Database: ' + err);
  } else {
    console.log('Successfully connected to MongoDB');
  }
});*/
mongoose.connect('mongodb://legalx_admin:legalx1234@ds125198.mlab.com:25198/legalx_db', function(err){
  if (err) {
    console.log('Not connected to Database: ' + err);
  } else {
    console.log('Successfully connected to MongoDB');
  }
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/Public/app/views/index.html'));
});

app.listen(process.env.PORT || port, function() {
  console.log('Server is running on port: ' + port);
});
