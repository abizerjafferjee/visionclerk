userApp.controller('spendController', function($scope, spendService, NgTableParams, $interval) {

  // $scope.invoiceTable = {};
  $scope.showMessage = false;
  // $scope.unprocessedInvoices = 0;
  // var promise;

  $scope.uploadFiles = function () {

      $scope.uploading = true;
      $scope.uploadSuccess = false;
      $scope.uploadFail = false;

      var files = $scope.invoices;

      spendService.uploadFiles(files)
        .then(function (response) {
          if (response.data.success) {
            $scope.uploading = false;
            $scope.uploadSuccess = true;
            $scope.uploadSuccessMessage = response.data.message;
            $scope.fileCount += response.data.files;
            $scope.getFiles();
            // $scope.getUnvalidatedInvoices();
            // $scope.getInvoices();

          } else {
            $scope.uploading = false;
            $scope.uploadFail = true;
            $scope.uploadFailMessage = response.data.message;
          }
        }, function (error) {
          $scope.uploading = false;
          $scope.showMessage = true;
          $scope.message = 'An error has occurred';
        });
  };

  $scope.getFiles = function() {
    spendService.getFiles()
      .then(function(response) {
        if (response.data.length !== 0) {
          $scope.showFilesTable = true;
          $scope.fileCount = response.data.length;
          $scope.filesTable = new NgTableParams({}, { dataset: response.data });

          // set last uploaded date
          var dt = new Date(response.data[0].date);
          for (var i=0; i<response.data.length; i++) {
            var nextDt = new Date(response.data[i].date);
            if (dt < nextDt) {
              dt = nextDt;
            }
          }
          $scope.lastUploaded = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear() + " @ "
            + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        } else {
          $scope.showFilesTable = false;
          $scope.filesMessage = "No files to display";
          $scope.fileCount = 0;
        }
      });
  };

  $scope.extractDate = function(date) {
    var dt = new Date(date);
    var parsed = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear();
    return parsed;
  };

  $scope.deleteFile = function(fileId) {
    spendService.deleteFile(fileId)
      .then(function(response) {
        console.log(response)
        if (response.data.success) {
          $scope.getFiles();
        }
      }, function(error) {
        console.log(error);
      });
  }

  $scope.getSchema = function() {
    spendService.getSchema()
      .then(function(response) {
        var a = document.createElement('a');
        a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(response.data);
        a.target = '_blank';
        a.download = 'filename.csv';
        document.body.appendChild(a);
        a.click();
      }, function(error) {
        console.log(error);
      });
  }

});
