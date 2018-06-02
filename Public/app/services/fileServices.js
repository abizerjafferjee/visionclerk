userApp.service('contractFileService', function ($http, $q) {

    this.uploadFilesToUrl = function (files) {
        //FormData, object of key/value pair for form fields and values
        var fileFormData = new FormData();

        for (var i=0; i<files.length; i++) {
          fileFormData.append("uploads[]", files[i], files[i]['name']);
        }

        var deffered = $q.defer();
        $http.post('/contract/upload', fileFormData, {
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
      $http.get('/contract/files')
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.getContracts = function() {

      var deffered = $q.defer();
      $http.get('/contract/contracts')
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.deleteFile = function(fileId) {

      var deffered = $q.defer();
      $http.post('/contract/deleteFile', {fileId: fileId})
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.deleteContract = function(contractId) {

      var deffered = $q.defer();
      $http.post('/contract/deleteContract', {contractId: contractId})
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

});

userApp.service('invoiceFileService', function ($http, $q) {

  this.uploadFilesToUrl = function (files) {

      var fileFormData = new FormData();
      for (var i=0; i<files.length; i++) {
        fileFormData.append("uploads[]", files[i], files[i]['name']);
      }

      var deffered = $q.defer();
      $http.post('/invoice/upload', fileFormData, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}

      }).then(function (response) {
          deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
  };

  this.processFiles = function () {

    var deffered = $q.defer();
    $http.get('/invoice/process')
    .then(function (response) {
        deffered.resolve(response);
    }, function(error) {
      deffered.reject();
    });

    return deffered.promise;

  };

  this.getFiles = function() {

    var deffered = $q.defer();
    $http.get('/invoice/files')
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  };

  this.getInvoices = function() {

    var deffered = $q.defer();
    $http.get('/invoice/invoices')
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;
  };

  this.editInvoice = function(newInvoice) {

    var deffered = $q.defer();
    $http.post('/invoice/edit', {invoice:newInvoice})
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;

  };

  this.sendFeedback = function(invoiceId, field) {

    var deffered = $q.defer();
    $http.post('/invoice/feedback', {id: invoiceId, field: field})
      .then(function(response) {
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

    return deffered.promise;

  };


});
