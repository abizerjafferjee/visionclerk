var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;
var bcrypt = require('bcrypt-nodejs');
var flash = require('express-flash');
var port = process.env.PORT || 8080;

// mongoose connect mongo
mongoose.connect('mongodb://localhost/visionclerk_users');

// configure passport
passport.use(new localStrategy(function(username, password, done) {
  User.findOne({username: username}, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, {message: 'Incorrect username.'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {message: 'Incorrect password.'});
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// user schema/model
var User = require('./app/Models/user.js');

// create instance of express
var app = express();

// require routes
var authRoutes = require('./app/routes/auth.js');
var contractRoutes = require('./app/routes/contract.js');
var invoiceRoutes = require('./app/routes/invoice.js');
var accountRoutes = require('./app/routes/account.js');

// middleware
app.use(express.static(path.join(__dirname)));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// routes

// app.use(function(req, res, next) {
//   res.locals.currentUser = req.user;
//   next();
// });

app.use('/user/', authRoutes);
app.use('/contract/', contractRoutes);
app.use('/invoice/', invoiceRoutes);
app.use(accountRoutes);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/Public/app/views/index.html'));
})

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/Public/app/views/index.html'));
});

app.listen(process.env.PORT || port, process.env.IP, function() {
  console.log('Server is running on port: ' + port);
});
