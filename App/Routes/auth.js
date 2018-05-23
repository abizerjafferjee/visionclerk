var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user.js');

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
        return res.status(500).json({
          err: err
        });
      }
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

// OLD CHANGES

// var pg            = require('pg');
// var PythonShell   = require('python-shell');
// var jwt           = require('jsonwebtoken');
// var secret        = 'mySecret';
// var nodemailer    = require('nodemailer');
// var request       = require('request');
// var util          = require('util');
//
// // EMAIL CREDENTIALS
// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   secure: false,
//   port: 25,
//   auth: {
//     user: 'legalxstartup@gmail.com',
//     pass: 'legalx1234'
//   }
// });
//
//
// // USER REGISTRATION ROUTE
// router.post('/users', function(req, res){
//   var user = new User();
//   user.username = req.body.username;
//   user.password = req.body.password;
//   user.email = req.body.email;
//   user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '3d' });
//   if (user.username == null || user.username == ''){
//     res.json({ success: false, message:'Please provide an Username'});
//   } else if (user.password == null || user.password == '') {
//     res.json({ success: false, message:'Please provide a Password'});
//   } else if (user.email == null || user.email == '') {
//     res.json({ success: false, message:'Please provide a email'});
//   } else {
//     user.save(function(err){
//       if (err) {
//
//         if (err.errors != null) {
//           if (err.errors.email) {
//             res.json({ success: false, message: err.errors.email.message });
//           } else if (err.errors.username) {
//             res.json({ success: false, message: err.errors.username.message });
//           } else if (err.errors.password) {
//             res.json({ success: false, message: err.errors.password.message });
//           } else {
//             res.json({ success: false, message: err });
//           }
//         } else if (err) {
//           if (err.code == 11000) {
//             res.json({ success: false, message: 'Username or E-mail already taken' });
//           } else {
//             res.json({ success: false, message: err });
//           }
//         }
//       } else {
//         var mailOptions = {
//           from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//           to: user.email,
//           subject: 'VisonClerk Account Activation link',
//           text: 'Hello ' + user.username + ', Thank you for registering at VisonClerk.com. Please click on the link below to complete your activation: http://www.visionclerk.com/activate/' + user.temporarytoken,
//           html: 'Hello <strong> ' + user.username + '</strong>,<br><br>Thank you for registering at VisonClerk.com. Please click on the link below to complete your activation.<br><br><a href="http://www.visionclerk.com/activate/' + user.temporarytoken + '">http://www.visionclerk.com/activate/</a>'
//         };
//
//         transporter.sendMail(mailOptions, function(err, info){
//           if (err) {
//             console.log(err);
//           } else {
//             console.log('Email sent');
//           }
//         });
//         res.json({ success: true, message:'Account registered! Please check your email for activation link.' });
//       }
//     });
//   }
// });
//
// // USER LOGIN ROUTE
// // http://localhost:8080/api/authenticate
// router.post('/authenticate', function(req, res){
//   User.findOne({ email: req.body.email })
//   .select('email username password active')
//   .exec(function(err, user){
//     if (err) throw err;
//     if (!user) {
//       res.json({ success: false, message: 'Could not authenticate user'});
//     } else if (user) {
//       if (req.body.password) {
//         var validPassword = user.comparePassword(req.body.password);
//       } else {
//         res.json({ success: false, message: 'No password provided'});
//       }
//       if (!validPassword) {
//         res.json({ success: false, message: 'Could not authenticate password'});
//       } else if (!user.active) {
//         res.json({ success: false, message: 'Account is not yet activated. Please check your email for activation link.', expired: true });
//       } else {
//         var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '3d' });
//         res.json({ success: true, message: 'User authenticated!', token: token });
//       }
//     }
//   });
// });
//
// router.put('/activate/:token', function(req, res) {
//   User.findOne({ temporarytoken: req.params.token }, function(err, user) {
//     if (err) throw err;
//     var token = req.params.token;
//     jwt.verify(token, secret, function(err, decoded){
//       if (err) {
//         console.log(err);
//         res.json({ success: false, message: 'Activation link has expired.'});
//       } else if (!user) {
//         res.json({ success: false, message: 'Activation link has expired.'});
//       } else {
//         user.temporarytoken = false;
//         user.active = true;
//         user.save(function(err) {
//           if (err) {
//             console.log(err);
//           } else {
//
//
//             var mailOptions = {
//               from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//               to: user.email,
//               subject: 'VisonClerk Account Activation link',
//               text: 'Hello' + user.username + ', Your account has been successfully activated!',
//               html: 'Hello<strong> ' + user.username + '</strong>,<br><br> Your VisonClerk account has been successfully activated!'
//             };
//
//             transporter.sendMail(mailOptions, function(err, info){
//               if (err) {
//                 console.log(err);
//               } else {
//                 console.log('Email sent');
//               }
//             });
//             res.json({ success: true, message: 'Account activated!'});
//           }
//         });
//       }
//     });
//   });
// });
//
// router.post('/resend', function(req, res){
//   User.findOne({ email: req.body.email })
//   .select('email password active')
//   .exec(function(err, user){
//     if (err) throw err;
//     if (!user) {
//       res.json({ success: false, message: 'Could not authenticate user'});
//     } else if (user) {
//       if (req.body.password) {
//         var validPassword = user.comparePassword(req.body.password);
//       } else {
//         res.json({ success: false, message: 'No password provided'});
//       }
//       if (!validPassword) {
//         res.json({ success: false, message: 'Could not authenticate password'});
//       } else if (user.active) {
//         res.json({ success: false, message: 'Account is already activated.' });
//       } else {
//         res.json({ success: true, user: user });
//       }
//     }
//   });
// });
//
// router.put('/resend', function(req, res) {
//   User.findOne({ email: req.body.email })
//   .select('username email temporarytoken')
//   .exec(function(err, user) {
//     if (err) throw err;
//     user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '3d' });
//     user.save(function(err) {
//       if (err) {
//         console.log(err);
//       } else {
//         var mailOptions = {
//           from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//           to: user.email,
//           subject: 'VisonClerk Account Activation link Request',
//           text: 'Hello ' + user.username + ', you recently requested a new account activation link at VisonClerk.com. Please click on the link below to complete your activation: http://www.visionclerk.com/activate/' + user.temporarytoken,
//           html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested a new account activation link at VisonClerk.com. Please click on the link below to complete your activation.<br><br><a href="http://www.visionclerk.com/activate/' + user.temporarytoken + '">http://www.visionclerk.com/activate/</a>'
//         };
//
//         transporter.sendMail(mailOptions, function(err, info){
//           if (err) {
//             console.log(err);
//           } else {
//             console.log('Email sent');
//           }
//         });
//         res.json({ success: true, message: 'Activation link has been sent to: ' + user.email + '!'});
//       }
//     })
//   })
// });
//
// router.get('/resetusername/:email', function(req, res) {
//   User.findOne({ email: req.params.email }).select('email username').exec(function(err, user) {
//     if (err) {
//       res.json({ success: false, message: err });
//     } else {
//       if (!req.params.email) {
//         res.json({ success: false, message: 'No Email was provided' });
//       } else {
//         if (!user){
//           res.json({ success: false, message: 'E-mail was not found!' });
//         } else {
//           var mailOptions = {
//             from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//             to: user.email,
//             subject: 'VisonClerk Username Request',
//             text: 'Hello ' + user.username + ', you recently requested your username! Your username is: ' + user.username,
//             html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested your username! Your username is: ' + user.username
//           };
//
//           transporter.sendMail(mailOptions, function(err, info){
//             if (err) {
//               console.log(err);
//             } else {
//               console.log('Email sent');
//             }
//           });
//
//           res.json({ success: true, message: 'Username has been sent to Email!' });
//         }
//       }
//     }
//   });
// });
//
// router.put('/resetpassword', function(req, res) {
//   User.findOne({ email: req.body.email })
//   .select('username active email resettoken')
//   .exec(function(err, user) {
//     if (err) throw err;
//     if (!user) {
//       res.json({ success: false, message: 'Email was not found!'})
//     } else if (!user.active) {
//       res.json({ success: false, message: 'Account has not yet been activated, Please check your Email!' })
//     } else {
//       user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '3d' });
//       user.save(function(err) {
//         if (err) {
//           res.json({ success: false, message: err });
//         } else {
//           var mailOptions = {
//             from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//             to: user.email,
//             subject: 'VisonClerk Reset Password Request',
//             text: 'Hello ' + user.username + ', you recently requested a password reset link. Please click on the link below to reset your password: href="http://www.visionclerk.com/newpassword/' + user.resettoken,
//             html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested a password reset link. Please click on the link below to reset your password:<br><br><a href="http://www.visionclerk.com/newpassword/' + user.resettoken + '">http://www.visionclerk.com/newpassword/</a>'
//           };
//
//           transporter.sendMail(mailOptions, function(err, info){
//             if (err) {
//               console.log(err);
//             } else {
//               console.log('Email sent');
//             }
//           });
//
//           res.json({ success: true, message: 'Please check your Email for the password reset link.' })
//         }
//       });
//     }
//   });
// });
//
// router.get('/resetpassword/:token', function(req, res) {
//   User.findOne({ resettoken: req.params.token })
//   .select()
//   .exec(function(err, user) {
//     if (err) throw err;
//     var token = req.params.token;
//     // function to verify token
//     jwt.verify(token, secret, function(err, decoded){
//       if (err) {
//         console.log(err);
//         res.json({ success: false, message: 'Reset Password link has expired!' });
//       } else {
//         if (!user) {
//           res.json({ success:false, message: 'Password link has expired!' });
//         } else {
//           res.json({ success: true, user: user });
//         }
//       }
//     });
//   });
// });
//
// router.put('/savepassword', function(req, res) {
//   User.findOne({ email: req.body.email })
//   .select('username email password resettoken')
//   .exec(function(err, user) {
//     if (err) throw err;
//     if (req.body.password == null || req.body.password == '') {
//       res.json({ success: false, message: 'Password not provided' });
//     } else {
//       user.password = req.body.password;
//       user.resettoken = false;
//       user.save(function(err) {
//         if (err) {
//           res.json({ success: false, message: err});
//         } else {
//           var mailOptions = {
//             from: 'VisonClerk Staff <legalxstartup@gmail.com>',
//             to: user.email,
//             subject: 'VisonClerk Reset Password',
//             text: 'Hello ' + user.username + ', this Email is to notify you that your password was recently reset at VisonClerk.com',
//             html: 'Hello <strong> ' + user.username + '</strong>,<br><br> This Email is to notify you that your password was recently reset at VisonClerk.com'
//           };
//
//           transporter.sendMail(mailOptions, function(err, info){
//             if (err) {
//               console.log(err);
//             } else {
//               console.log('Email sent');
//             }
//           });
//           res.json({ success: true, message: 'Password has been reset!' });
//         }
//       });
//     }
//   });
// });
//
// module.exports = router;
