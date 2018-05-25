userApp.service('fileUploadService', function ($http, $q) {

    this.uploadFilesToUrl = function (files) {
        //FormData, object of key/value pair for form fields and values
        var fileFormData = new FormData();

        for (var i=0; i<files.length; i++) {
          fileFormData.append("uploads[]", files[i], files[i]['name']);
        }


        // fileFormData.append('file', file);

        var deffered = $q.defer();
        $http.post('/upload', fileFormData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}

        }).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    }


    this.extractFromFiles = function() {

      var deffered = $q.defer();
      $http.get('/extract').
        then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;

    }

    this.getFiles = function() {

      var deffered = $q.defer();
      $http.get('/files')
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.getContracts = function() {

      var deffered = $q.defer();
      $http.get('/contracts')
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }
});
