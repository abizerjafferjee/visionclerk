var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');

// SUPPLIERS

router.get('/totalSpend', function(req, res) {
  sql.spend(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/transactions', function(req, res) {
  sql.transactions(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/suppliers', function(req, res) {
  sql.suppliers(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/spendTransactionScatter', function(req, res) {
  sql.spendTransactionScatter(function(results) {
    res.json({success: true, data: results});
  });
});


router.get('/spendTransactionsPerSupplier', function(req, res) {
  sql.spendTransactionsPerSupplier(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/spendSuppliersAndTransactionsOvertime', function(req, res) {
  sql.spendSuppliersAndTransactionsOvertime(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/spendSupplierDistributions', function(req, res) {
  sql.spendSupplierDistributions(function(results) {
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



router.get('/suppliersOvertimePerCategory', function(req, res) {
  sql.suppliersOvertimePerCategory(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/transactionsOvertimePerCategory', function(req, res) {
  sql.transactionsOvertimePerCategory(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

// INSIGHTS
router.get('/duplicateSpend', function(req, res) {
  sql.duplicateSpend(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/highSpendLastMonth', function(req, res) {
  sql.highSpendLastMonth(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/highSpendLastYear', function(req, res) {
  sql.highSpendLastYear(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

router.get('/outlierTransactions', function(req, res) {
  sql.outlierTransactions(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});

// CATEGORY
router.get('/spendSuppliersAndTransactionsPerCategory', function(req, res) {
  sql.spendSuppliersAndTransactionsPerCategory(function(results) {
    console.log(results);
    res.json({success: true, data: results});
  });
});


module.exports = router;
