userApp.service('spendAnalyticsService', function ($http, $q) {

  this.totalSpend = function () {

      var deffered = $q.defer();
      $http.get('/analytics/totalSpend').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.transactions = function () {

      var deffered = $q.defer();
      $http.get('/analytics/transactions').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.suppliers = function () {

      var deffered = $q.defer();
      $http.get('/analytics/suppliers').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.categories = function () {

      var deffered = $q.defer();
      $http.get('/analytics/categories').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.allSpend = function () {

      var deffered = $q.defer();
      $http.get('/analytics/allSpend').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  // Suppliers
  this.allSuppliers = function () {

      var deffered = $q.defer();
      $http.get('/analytics/allSuppliers').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.suppliersPerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/suppliersPerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendTransactionScatter = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendTransactionScatter').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendTransactionPerSupplier = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendTransactionsPerSupplier').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendSuppliersAndTransactionsOvertime = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendSuppliersAndTransactionsOvertime').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendSupplierDistributions = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendSupplierDistributions').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.suppliersOvertimePerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/suppliersOvertimePerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.transactionsOvertimePerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/transactionsOvertimePerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  // INSIGHTS
  this.duplicateSpend = function () {

      var deffered = $q.defer();
      $http.get('/analytics/duplicateSpend').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.highSpendLastMonth = function () {

      var deffered = $q.defer();
      $http.get('/analytics/highSpendLastMonth').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.highSpendLastYear = function () {

      var deffered = $q.defer();
      $http.get('/analytics/highSpendLastYear').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.outlierTransactions = function () {

      var deffered = $q.defer();
      $http.get('/analytics/outlierTransactions').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.outlierSuppliersPerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/outlierSuppliersPerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.oneTimeSuppliersPerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/oneTimeSuppliersPerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  // CATEGORY
  this.spendSuppliersAndTransactionsPerCategory = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendSuppliersAndTransactionsPerCategory').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.highGrowthCategories = function () {

      var deffered = $q.defer();
      $http.get('/analytics/highGrowthCategories').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendCategoryDistributions = function () {

      var deffered = $q.defer();
      $http.get('/analytics/spendCategoryDistributions').then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  // EACH CATEGORY

  this.byCategory = function (categoryName) {

      var deffered = $q.defer();
      $http.get('/analytics/categories/' + categoryName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendOvertimePerCategory = function (categoryName) {

      var deffered = $q.defer();
      $http.get('/analytics/categories/spendOvertimePerCategory/' + categoryName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  // EACH SUPPLIER
  this.bySupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.spendOvertimePerSupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/spendOvertimePerSupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.duplicateSpendSupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/duplicateSpendSupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.crossCategorySupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/crossCategorySupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.highGrowthSupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/highGrowthSupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.outlierTransactionsSupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/outlierTransactionsSupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.outlierSupplier = function (supplierName) {

      var deffered = $q.defer();
      $http.get('/analytics/supplier/outlierSupplier/' + supplierName).then(function (response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

});
