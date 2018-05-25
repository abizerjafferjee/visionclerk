userApp.controller('fileUploadController', function ($scope, fileUploadService) {

    $scope.myFiles = {};
    $scope.showMessage = false;

    $scope.uploadFiles = function () {

        $scope.uploading = true;
        var files = $scope.myFiles;

        fileUploadService.uploadFilesToUrl(files)
          .then(function (response) {
            if (response.data.success) {
              $scope.success = true;
              $scope.uploading = false;
              $scope.showMessage = true;
              $scope.uploadedFiles = response.data.files;
              $scope.message = Object.keys(response.data.files).length + ' ' + response.data.message;
              $scope.myFile = {};

              processFiles();

            } else {
              $scope.success = false;
              $scope.showMessage = true;
              $scope.uploading = false;
              $scope.message = response.data.message;
              $scope.myFile = {};
            }
          }, function (error) {
            $scope.uploading = false;
            $scope.message = 'An error has occurred';
          });
    };

    var processFiles = function() {

      $scope.processingStatus = true;
      $scope.processingMessage = "Processing files..."

      fileUploadService.extractFromFiles()
        .then(function(response) {
          if (response.data.success) {
            $scope.processingMessage = "Processing complete";
          } else {
            $scope.processingMessage = "Something went wrong while processing";
          }
        }, function(error) {
          $scope.processingMessage = "Something went wrong while processing";
        });

    }

    $scope.displayFiles = function() {
      fileUploadService.getFiles()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.table = response.data;
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.displayContracts = function() {
      fileUploadService.getContracts()
        .then(function(response) {
          console.log(response.data);
          if (response.data.length !== 0) {
            $scope.contracts = response.data;
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.refreshData = function() {
      fileUploadService.extractFromFiles()
        .then(function(response) {
          if (response.data.success) {
            $scope.displayFiles();
            $scope.displayContracts();
          }
        }, function(error) {
          console.log(error);
        });
    }
});
