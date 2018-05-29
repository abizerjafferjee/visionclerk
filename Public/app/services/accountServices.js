userApp.service('accountService', function ($http, $q) {

  this.getUserProfile = function () {

    var deferred = $q.defer();

    $http.get('/account')
      .then(function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject();
      });

    return deferred.promise;

  };

  this.updateProfile = function(updatedAccount, accountId) {

    var deferred = $q.defer();

    $http.post('/account', {account: updatedAccount, id: accountId})
      .then(function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject();
      });

    return deferred.promise;

  }


});
