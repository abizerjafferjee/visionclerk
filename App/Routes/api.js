var User          = require('../Models/User.js')
var pg            = require('pg');
var PythonShell   = require('python-shell');
var jwt           = require('jsonwebtoken');
var secret        = 'mySecret';
var ml_model      = '//home//bitnami//projects//legalx//App//Routes//my_python.py';
var nodemailer    = require('nodemailer');
var request       = require('request');
var format = require('string-format')
var util = require('util');

module.exports = function(router) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: 'legalxstartup@gmail.com',
      pass: 'legalx1234'
    }
  });

  // USER REGISTRATION ROUTE
  //http://localhost:8080/api/users
  router.post('/users', function(req, res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    if (user.username == null || user.username == ''){
      res.json({ success: false, message:'Please provide an Username'});
    } else if (user.password == null || user.password == '') {
      res.json({ success: false, message:'Please provide a Password'});
    } else if (user.email == null || user.email == '') {
      res.json({ success: false, message:'Please provide a email'});
    } else {
      user.save(function(err){
        if (err) {

          if (err.errors != null) {
            if (err.errors.email) {
              res.json({ success: false, message: err.errors.email.message });
            } else if (err.errors.username) {
              res.json({ success: false, message: err.errors.username.message });
            } else if (err.errors.password) {
              res.json({ success: false, message: err.errors.password.message });
            } else {
              res.json({ success: false, message: err });
            }
          } else if (err) {
            if (err.code == 11000) {
              res.json({ success: false, message: 'Username or E-mail already taken' });
            } else {
              res.json({ success: false, message: err });
            }
          }
        } else {
          var mailOptions = {
            from: 'VisonClerk Staff <legalxstartup@gmail.com>',
            to: user.email,
            subject: 'VisonClerk Account Activation link',
            text: 'Hello ' + user.username + ', Thank you for registering at VisonClerk.com. Please click on the link below to complete your activation: http://35.183.35.209:8080/activate/' + user.temporarytoken,
            html: 'Hello <strong> ' + user.username + '</strong>,<br><br>Thank you for registering at VisonClerk.com. Please click on the link below to complete your activation.<br><br><a href="http://35.183.35.209:8080/activate/' + user.temporarytoken + '">http://35.183.35.209:8080/activate/</a>'
          };

          transporter.sendMail(mailOptions, function(err, info){
            if (err) {
              console.log(err);
            } else {
              console.log('Email sent');
            }
          });
          res.json({ success: true, message:'Account registered! Please check your email for activation link.' });
        }
      });
    }
  });

  // USER LOGIN ROUTE
  // http://localhost:8080/api/authenticate
  router.post('/authenticate', function(req, res){
    User.findOne({ email: req.body.email })
    .select('email username password active')
    .exec(function(err, user){
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Could not authenticate user'});
      } else if (user) {
        if (req.body.password) {
          var validPassword = user.comparePassword(req.body.password);
        } else {
          res.json({ success: false, message: 'No password provided'});
        }
        if (!validPassword) {
          res.json({ success: false, message: 'Could not authenticate password'});
        } else if (!user.active) {
          res.json({ success: false, message: 'Account is not yet activated. Please check your email for activation link.', expired: true });
        } else {
          var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
          res.json({ success: true, message: 'User authenticated!', token: token });
        }
      }
    });
  });

  router.put('/activate/:token', function(req, res) {
    User.findOne({ temporarytoken: req.params.token }, function(err, user) {
      if (err) throw err;
      var token = req.params.token;
      jwt.verify(token, secret, function(err, decoded){
        if (err) {
          console.log(err);
          res.json({ success: false, message: 'Activation link has expired.'});
        } else if (!user) {
          res.json({ success: false, message: 'Activation link has expired.'});
        } else {
          user.temporarytoken = false;
          user.active = true;
          user.save(function(err) {
            if (err) {
              console.log(err);
            } else {


              var mailOptions = {
                from: 'VisonClerk Staff <legalxstartup@gmail.com>',
                to: user.email,
                subject: 'VisonClerk Account Activation link',
                text: 'Hello' + user.username + ', Your account has been successfully activated!',
                html: 'Hello<strong> ' + user.username + '</strong>,<br><br> Your VisonClerk account has been successfully activated!'
              };

              transporter.sendMail(mailOptions, function(err, info){
                if (err) {
                  console.log(err);
                } else {
                  console.log('Email sent');
                }
              });
              res.json({ success: true, message: 'Account activated!'});
            }
          });
        }
      });
    });
  });

  router.post('/resend', function(req, res){
    User.findOne({ email: req.body.email })
    .select('email password active')
    .exec(function(err, user){
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Could not authenticate user'});
      } else if (user) {
        if (req.body.password) {
          var validPassword = user.comparePassword(req.body.password);
        } else {
          res.json({ success: false, message: 'No password provided'});
        }
        if (!validPassword) {
          res.json({ success: false, message: 'Could not authenticate password'});
        } else if (user.active) {
          res.json({ success: false, message: 'Account is already activated.' });
        } else {
          res.json({ success: true, user: user });
        }
      }
    });
  });

  router.put('/resend', function(req, res) {
    User.findOne({ email: req.body.email })
    .select('username email temporarytoken')
    .exec(function(err, user) {
      if (err) throw err;
      user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
      user.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          var mailOptions = {
            from: 'VisonClerk Staff <legalxstartup@gmail.com>',
            to: user.email,
            subject: 'VisonClerk Account Activation link Request',
            text: 'Hello ' + user.username + ', you recently requested a new account activation link at VisonClerk.com. Please click on the link below to complete your activation: http://35.183.35.209:8080/activate/' + user.temporarytoken,
            html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested a new account activation link at VisonClerk.com. Please click on the link below to complete your activation.<br><br><a href="http://35.183.35.209:8080/activate/' + user.temporarytoken + '">http://35.183.35.209:8080/activate/</a>'
          };

          transporter.sendMail(mailOptions, function(err, info){
            if (err) {
              console.log(err);
            } else {
              console.log('Email sent');
            }
          });
          res.json({ success: true, message: 'Activation link has been sent to: ' + user.email + '!'});
        }
      })
    })
  });

  router.get('/resetusername/:email', function(req, res) {
    User.findOne({ email: req.params.email }).select('email username').exec(function(err, user) {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!req.params.email) {
          res.json({ success: false, message: 'No Email was provided' });
        } else {
          if (!user){
            res.json({ success: false, message: 'E-mail was not found!' });
          } else {
            var mailOptions = {
              from: 'VisonClerk Staff <legalxstartup@gmail.com>',
              to: user.email,
              subject: 'VisonClerk Username Request',
              text: 'Hello ' + user.username + ', you recently requested your username! Your username is: ' + user.username,
              html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested your username! Your username is: ' + user.username
            };

            transporter.sendMail(mailOptions, function(err, info){
              if (err) {
                console.log(err);
              } else {
                console.log('Email sent');
              }
            });

            res.json({ success: true, message: 'Username has been sent to Email!' });
          }
        }
      }
    });
  });

  router.put('/resetpassword', function(req, res) {
    User.findOne({ email: req.body.email })
    .select('username active email resettoken')
    .exec(function(err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Email was not found!'})
      } else if (!user.active) {
        res.json({ success: false, message: 'Account has not yet been activated, Please check your Email!' })
      } else {
        user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        user.save(function(err) {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            var mailOptions = {
              from: 'VisonClerk Staff <legalxstartup@gmail.com>',
              to: user.email,
              subject: 'VisonClerk Reset Password Request',
              text: 'Hello ' + user.username + ', you recently requested a password reset link. Please click on the link below to reset your password: href="http://35.183.35.209:8080/newpassword/' + user.resettoken,
              html: 'Hello <strong> ' + user.username + '</strong>,<br><br>You recently requested a password reset link. Please click on the link below to reset your password:<br><br><a href="http://35.183.35.209:8080/newpassword/' + user.resettoken + '">http://35.183.35.209:8080/newpassword/</a>'
            };

            transporter.sendMail(mailOptions, function(err, info){
              if (err) {
                console.log(err);
              } else {
                console.log('Email sent');
              }
            });

            res.json({ success: true, message: 'Please check your Email for the password reset link.' })
          }
        });
      }
    });
  });

  router.get('/resetpassword/:token', function(req, res) {
    User.findOne({ resettoken: req.params.token })
    .select()
    .exec(function(err, user) {
      if (err) throw err;
      var token = req.params.token;
      // function to verify token
      jwt.verify(token, secret, function(err, decoded){
        if (err) {
          console.log(err);
          res.json({ success: false, message: 'Reset Password link has expired!' });
        } else {
          if (!user) {
            res.json({ success:false, message: 'Password link has expired!' });
          } else {
            res.json({ success: true, user: user });
          }
        }
      });
    });
  });

  router.put('/savepassword', function(req, res) {
    User.findOne({ email: req.body.email })
    .select('username email password resettoken')
    .exec(function(err, user) {
      if (err) throw err;
      if (req.body.password == null || req.body.password == '') {
        res.json({ success: false, message: 'Password not provided' });
      } else {
        user.password = req.body.password;
        user.resettoken = false;
        user.save(function(err) {
          if (err) {
            res.json({ success: false, message: err});
          } else {
            var mailOptions = {
              from: 'VisonClerk Staff <legalxstartup@gmail.com>',
              to: user.email,
              subject: 'VisonClerk Reset Password',
              text: 'Hello ' + user.username + ', this Email is to notify you that your password was recently reset at VisonClerk.com',
              html: 'Hello <strong> ' + user.username + '</strong>,<br><br> This Email is to notify you that your password was recently reset at VisonClerk.com'
            };

            transporter.sendMail(mailOptions, function(err, info){
              if (err) {
                console.log(err);
              } else {
                console.log('Email sent');
              }
            });
            res.json({ success: true, message: 'Password has been reset!' });
          }
        });
      }
    });
  });

  router.delete('/deleteaccount/:email', function(req, res) {
     User.findOneAndRemove({ email: req.params.email })
     .exec(function(err, info) {
       if (err) {
         res.json({ success: false, message: 'Something went wrong, account could NOT be deleted!' });
       } else {
         res.json({ success: true, message: 'Account successfully deleted!' });
       }
     });
  });

  router.use(function(req, res, next){
    var token = req.body.token || req.headers['x-access-token'];

    if (token){
      // function to verify token
      jwt.verify(token, secret, function(err, decoded){
        if (err) {
          console.log(err);
          res.json({ success: false, message: 'Invalid token'});
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.json({ success: false, message: 'No token provided' });
    }
  });

  router.post('/currentUser', function(req, res){
    res.send(req.decoded);
  });

  // data to send: id | username | query | id/caserank | docid | score(0,1)
  router.post('/userfeedback', function(req, res) {
    /*console.log(req.body.user_name);
    console.log(req.body.userquery);
    console.log(req.body.caseid);
    console.log(req.body.rel_score);*/

    // Connecting to the PSQL DB
    var connectionString = 'postgres://legalmaster95:Oklnmgh**&@legalxinstance.clfgvqoltleg.ca-central-1.rds.amazonaws.com:5432/legalx_db';
    var client = new pg.Client(connectionString);
    client.connect(err => {
      if (err) { throw err; }
    });
    var query = client.query('set search_path to user_feedback');
    console.log("INSERT INTO relevancy_score (username, query, id, docid, score) VALUES ('" + req.body.user_name + "','" + req.body.userquery + "'," + req.body.caserank + ",'" + req.body.docid + "'," + req.body.rel_score + ")");
    var query2 = client.query("INSERT INTO relevancy_score (username, query, id, docid, score) VALUES ('" + req.body.user_name + "','" + req.body.userquery + "'," + req.body.caserank + ",'" + req.body.docid + "'," + req.body.rel_score + ")");
    query2.then((result) =>
      // link to res.row type: https://github.com/brianc/node-postgres/wiki/FAQ
      res.json(JSON.parse(JSON.stringify(result))));
  });

  // USER SEARCH ROUTE
  //http://localhost:8080/api/search
  router.post('/search', function(req, res){

    /*console.log(req.body.query);
    console.log(req.decoded.username);*/

    // sending requests to python API
    var headersOpt = {
        "content-type": "application/json",
    };

    request({
        method:'post',
        url:'http://localhost:5000/predict',
        form: {query:req.body.query, user:req.decoded.username},
        headers: headersOpt,
        json: true,},
        function (error, response, body) {
          //Print the Response
          if(body.success == false) {
              console.log(body);
          } else if(body.success == true) {
              //console.log(body.table_name);
              var results_table = body.table_name;

              // Connecting to the PSQL DB
              var connectionString = 'postgres://legalmaster95:Oklnmgh**&@legalxinstance.clfgvqoltleg.ca-central-1.rds.amazonaws.com:5432/legalx_db';
              var client = new pg.Client(connectionString);
              client.connect(err => {
                if (err) { throw err; }
              });
              // id = 1234 int and docid = "D-0" str
              //var query2 = client.query('SELECT id, docid, casename, court, doc_raw_text FROM ' + results_table + ' LIMIT 233');
              var formatted_query = util.format('SELECT id, casename, datefiled, court, A.docid, doc_raw_text, relevance, cos_sim FROM legalx_schema.vc_documents as A, %s where A.id = index', results_table);
              var query2 = client.query(formatted_query);
              query2.then((result) =>
                // link to res.row type: https://github.com/brianc/node-postgres/wiki/FAQ
                res.json(JSON.parse(JSON.stringify(result.rows))));
          } else {
              console.log(error);
          }
        });

    // spawning python program
    /*var options = {
      mode: 'text',
      pythonPath: '/home/bitnami/anaconda3/bin/python',
      pythonOptions: ['-u'],
      scriptPath: '/home/bitnami/projects/legalx/App/Routes',
      args: [req.body.query]
    };
    // Triggers Python model to retrieve db table containing relevant documents to the user query
    var spawn = require('child_process').spawn;
    //var proc = spawn('python', ['C://Users//gilberto//Desktop//work//Freelance//LegalX//LEGALX_GIT_REPO/legalx//App//Routes//my_python.py', req.body.query]);
    var proc = spawn('python', [ml_model, req.body.query]);

    //python program output
    proc.stdout.on('data', function(data){
      // data holds the psql table name that contains all documents related to the user's query
      var results_table = data.toString('utf8');

      // Connecting to the PSQL DB
      var connectionString = 'postgres://legalmaster95:Oklnmgh**&@legalxinstance.clfgvqoltleg.ca-central-1.rds.amazonaws.com:5432/legalx_db';
      var client = new pg.Client(connectionString);
      client.connect(err => {
        if (err) { throw err; }
      });
      var query = client.query('set search_path to legalx_schema');
      // id = 1234 int and docid = "D-0" str
      var query2 = client.query('SELECT id, docid, casename, court, doc_raw_text FROM ' + results_table + ' LIMIT 233');
      query2.then((result) =>
        // link to res.row type: https://github.com/brianc/node-postgres/wiki/FAQ
        res.json(JSON.parse(JSON.stringify(result.rows))));
    });

    // python program error
    proc.stderr.on('data', function(data){
      var buff = new Buffer(data);
      console.log('******* THERE WAS AN ERROR EXECUTING PYTHON: ');
      console.log(buff.toString('utf8'));
    });*/
  });

  return router;
}
