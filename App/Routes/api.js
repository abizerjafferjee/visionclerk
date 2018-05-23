var express = require("express");
var router = express.Router();


var pg            = require('pg');
var PythonShell   = require('python-shell');
var jwt           = require('jsonwebtoken');
var secret        = 'mySecret';
var nodemailer    = require('nodemailer');
var request       = require('request');
var util          = require('util');

// WATSON ENVIRONMENT PARAMETERS
// var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
// collection_id = '0f01bb27-4154-4995-9887-577be72218f2';
// configuration_id = 'b79654d2-76d8-48e1-be0b-5601a9738daf';
// environment_id = '18d60b1b-d3eb-4a55-9a9b-0fd9a3281aa7';
//
//
// // WATSON CREDENTIALS
// var discovery = new DiscoveryV1({
//   username: "0878e83e-37b8-4e8a-bd8f-9be48e1ac754",
//   password: "YGCfaBJTwi3S",
//   version_date: '2017-11-07'
// });

router.post('/displaycase/:case_id', function(req, res) {
  console.log(req.params.case_id);
  //console.log(req.body);
  res.json(req.body);
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
  // Connecting to the PSQL DB
  var connectionString = 'postgres://legalmaster95:Oklnmgh**&@legalxinstance.clfgvqoltleg.ca-central-1.rds.amazonaws.com:5432/legalx_db';
  var client = new pg.Client(connectionString);
  client.connect(err => {
    if (err) { throw err; }
  });
  //var query = client.query('set search_path to user_feedback');
  console.log("INSERT INTO user_feedback.relevancy_score (username, query, docid, score) VALUES ('" + req.body.username + "','" + req.body.query + "','" + req.body.docid + "'," + req.body.score + ")");
  var query2 = client.query("INSERT INTO user_feedback.relevancy_score (username, query, docid, score) VALUES ('" + req.body.username + "','" + req.body.query + "','" + req.body.docid + "'," + req.body.score + ")");
  query2.then((result) =>
    // link to res.row type: https://github.com/brianc/node-postgres/wiki/FAQ
    res.json(JSON.parse(JSON.stringify(result))));
});

// USER SEARCH ROUTE
//http://localhost:8080/api/search
router.post('/search', function(req, res){
  console.log(req.body.query);
  // WATSON API QUERY
  //QUERY PARAMETERS
  natural_language_query = req.body.query;
  count = 100;
  offset = 0;
  passages = true;
  highlight = true;
  //return_fields = ['id', 'result_metadata', 'extracted_metadata', 'html', 'enriched_text', 'highlight'];
  filter = 'enriched_text.entities.type:Organization,enriched_text.entities.type:Location';
  // aggregation = '';
  // sort = [];

  parameters = {environment_id: environment_id, collection_id: collection_id,
                natural_language_query: natural_language_query, count: count,
                offset: offset, passages: passages, highlight: highlight};

  //QUERY
  discovery.query(parameters, function(error, data) {
    // MAKE SURE TO TAKE CARE OF THE ERRORS IF THEY HAPPEN
    res.json(data);
  });
});


module.exports = router;
