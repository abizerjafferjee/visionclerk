var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../Models/user.js');
var Account = require('../Models/account.js');

// register user
router.post('/register', function(req, res) {
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  user.save(function(err) {
    req.logIn(user, function(err) {
      if(err) {
        console.log("ERRR");
        return res.status(500).json({
          err: err
        });
      }

      // create user info account
      var account = new Account({
        userName: user.username,
        emailAddress: user.email,
        role: 'Analyst',
        plan: 'Basic',
        user: user
      }).save(function(err) {
        if (err) {
          console.log(err);
        }
      });

      res.status(200).json({
        status: 'Registration successful'
      });
    });
  });
});

// login user
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        user: user,
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

// logout user
router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

// get user login status
router.get('/status', function(req, res) {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      status: true
    });
  } else {
    res.status(200).json({
      status: false
    });
  }
});

// send user password reset link
router.post('/forgot', function(req ,res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user) {
        if(!user) {
          return res.status(500).json({
            status: false
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
          user: 'legalxstartup@gmail.com',
          pass: 'legalx1234'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'legalxstartup@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/#/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
          res.status(500).json({
            status: false
          });
        } else {
          res.status(200).json({
            status: true
          });
        }
      });
    }
  ], function(err) {
    if(err) {
      res.status(500).json({
        status: false
      });
      return next(err);
    }
  });
});


router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},
  function(err, user) {
    if (!user) {
      res.status(500).json({
        status: false
      });
    } else {
      res.status(200).json({
        status: true
      });
    }
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},
      function(err, user) {
        if (!user) {
          res.status(500).json({
            status: false
          });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    }, function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
          user: 'legalxstartup@gmail.com',
          pass: 'legalx1234'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'legalxstartup@gmail.com',
        subject: 'Node.js Password Reset Confirmation',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
          res.status(500).json({
            status: false
          });
        } else {
          res.status(200).json({
            status: true
          });
        }
      });
    }
  ], function(err) {
    if(err) {
      res.status(500).json({
        status: false
      });
      return next(err);
    }
  });
});


module.exports = router;
