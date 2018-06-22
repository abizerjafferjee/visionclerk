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

    this.getUnvalidatedContracts = function() {

      var deffered = $q.defer();
      $http.get('/contract/unvalidatedContracts')
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.validateContract = function(contractId) {
      var deffered = $q.defer();
      $http.post('/contract/validate', {id: contractId})
        .then(function(response) {
          deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

      return deffered.promise;
    }

    this.editContract = function(contract) {
      var deffered = $q.defer();
      $http.post('/contract/edit', {contract: contract})
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

  this.getUnvalidatedInvoices = function() {

    var deffered = $q.defer();
    $http.get('/invoice/unvalidatedInvoices')
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

  this.validateInvoice = function(invoiceId) {

    var deffered = $q.defer();
    $http.post('/invoice/validate', {id:invoiceId})
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

userApp.service('accountsPayableFileService', function ($http, $q) {

  this.uploadFilesToUrl = function (files) {

      var fileFormData = new FormData();
      for (var i=0; i<files.length; i++) {
        fileFormData.append("uploads[]", files[i], files[i]['name']);
      }

      var deffered = $q.defer();
      //console.log("1");
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

});
