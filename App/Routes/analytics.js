var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');

router.get('/duplicateSpend', function(req, res) {
  sql.duplicateSpend(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/allSpend', function(req, res) {
  sql.allSpend(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/suppliersPerCategory', function(req, res) {
  sql.suppliersPerCategory(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

module.exports = router;
