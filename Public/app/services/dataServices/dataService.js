userApp.service('dataService', function ($http, $q) {

  this.getFiles = function() {

    var deffered = $q.defer();
    $http.get('/data/files/read')
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  };

});
