var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');

//ALL
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

router.get('/categories', function(req, res) {
  sql.categories(function(results) {
    res.json({success: true, data: results});
  });
});

// SUPPLIERS
router.get('/allSuppliers', function(req, res) {
  sql.allSuppliers(function(results) {
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
    res.json({success: true, data: results});
  });
});

router.get('/suppliersOvertimePerCategory', function(req, res) {
  sql.suppliersOvertimePerCategory(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/transactionsOvertimePerCategory', function(req, res) {
  sql.transactionsOvertimePerCategory(function(results) {
    res.json({success: true, data: results});
  });
});

// INSIGHTS
router.get('/duplicateSpend', function(req, res) {
  sql.duplicateSpend(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/highSpendLastMonth', function(req, res) {
  sql.highSpendLastMonth(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/highSpendLastYear', function(req, res) {
  sql.highSpendLastYear(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/outlierTransactions', function(req, res) {
  sql.outlierTransactions(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/outlierSuppliersPerCategory', function(req, res) {
  sql.outlierSuppliersPerCategory(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/oneTimeSuppliersPerCategory', function(req, res) {
  sql.oneTimeSuppliersPerCategory(function(results) {
    res.json({success: true, data: results});
  });
});

// CATEGORY
router.get('/spendSuppliersAndTransactionsPerCategory', function(req, res) {
  sql.spendSuppliersAndTransactionsPerCategory(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/highGrowthCategories', function(req, res) {
  sql.highGrowthCategories(function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/spendCategoryDistributions', function(req, res) {
  sql.spendCategoryDistributions(function(results) {
    res.json({success: true, data: results});
  });
});

// EACH CATEGORY
router.get('/categories/:category_name', function(req, res) {
  sql.byCategory(req.params.category_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/categories/spendOvertimePerCategory/:category_name', function(req, res) {
  sql.spendOvertimePerCategory(req.params.category_name, function(results) {
    res.json({success: true, data: results});
  });
});

// EACH SUPPLIER
router.get('/supplier/:supplier_name', function(req, res) {
  sql.bySupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/spendOvertimePerSupplier/:supplier_name', function(req, res) {
  sql.spendOvertimePerSupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/duplicateSpendSupplier/:supplier_name', function(req, res) {
  sql.duplicateSpendSupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/crossCategorySupplier/:supplier_name', function(req, res) {
  sql.crossCategorySupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/highGrowthSupplier/:supplier_name', function(req, res) {
  sql.highGrowthSupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/outlierTransactionsSupplier/:supplier_name', function(req, res) {
  sql.outlierTransactionsSupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});

router.get('/supplier/outlierSupplier/:supplier_name', function(req, res) {
  sql.outlierSupplier(req.params.supplier_name, function(results) {
    res.json({success: true, data: results});
  });
});




module.exports = router;
