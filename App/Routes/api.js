var User          = require('../Models/User.js')
var pg            = require('pg');
var PythonShell   = require('python-shell');
var jwt           = require('jsonwebtoken');
var secret        = 'mySecret';
var ml_model      = '//home//bitnami//projects//legalx//App//Routes//my_python.py';

module.exports = function(router) {
  // USER REGISTRATION ROUTE
  //http://localhost:8080/api/users
  router.post('/users', function(req, res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
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
          res.json({ success: true, message:'User created' });
        }
      });
    }
  });

  // USER LOGIN ROUTE
  // http://localhost:8080/api/authenticate
  router.post('/authenticate', function(req, res){
    User.findOne({ email: req.body.email })
    .select('email username password')
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
        } else {
          var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
          res.json({ success: true, message: 'User authenticated!', token: token });
        }
      }
    });
  });

  router.use(function(req, res, next){
    var token = req.body.token || req.headers['x-access-token'];

    if (token){
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

  // USER SEARCH ROUTE
  //http://localhost:8080/api/search
  router.post('/search', function(req, res){
    var options = {
      mode: 'text',
      pythonPath: '/home/bitnami/anaconda3/bin/python',
      pythonOptions: ['-u'],
      scriptPath: '/home/bitnami/projects/legalx/App/Routes',
      args: [req.body.query]
    };

    // Triggers Python model to retrieve db table containing relevant documents to the user query
    var spawn = require('child_process').spawn;
    var proc = spawn('python', [ml_model, req.body.query]);
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
      var query2 = client.query('SELECT docid, casename, court, documenttext FROM ' + results_table + ' LIMIT 10');
      query2.then((result) =>
        // link to res.row type: https://github.com/brianc/node-postgres/wiki/FAQ
        res.json(JSON.parse(JSON.stringify(result.rows))));
    });
    proc.stderr.on('data', function(data){
      var buff = new Buffer(data);
      console.log('******* THERE WAS AN ERROR EXECUTING PYTHON: ');
      console.log(buff.toString('utf8'));
    });
  });

  return router;
}
