userApp.service('spendService', function ($http, $q) {

  this.uploadFiles = function (files) {

      var fileFormData = new FormData();
      for (var i=0; i<files.length; i++) {
        fileFormData.append("uploads[]", files[i], files[i]['name']);
      }

      var deffered = $q.defer();
      $http.post('/spend/upload', fileFormData, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}

      }).then(function (response) {
          deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.getFiles = function() {

    var deffered = $q.defer();
    $http.get('/spend/files/read')
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  };

  this.deleteFile = function(fileId) {

    var deffered = $q.defer();
    $http.delete('/spend/files/delete/'+ fileId)
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  }

  this.getSchema = function(fileId) {

    var deffered = $q.defer();
    $http.get('/spend/files/schema')
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  }

});
