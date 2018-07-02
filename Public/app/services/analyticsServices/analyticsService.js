userApp.service('spendAnalyticsService', function ($http, $q) {

  this.duplicateSpend = function () {

      var deffered = $q.defer();
      $http.get('/analytics/duplicateSpend').then(function (response) {
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

});
