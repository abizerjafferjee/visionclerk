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

  this.allSpend = function () {

      var deffered = $q.defer();
      $http.get('/analytics/allSpend').then(function (response) {
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


});
