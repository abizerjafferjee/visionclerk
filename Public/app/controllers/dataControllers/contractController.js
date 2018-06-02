userApp.controller('contractFileController', function ($scope, contractFileService, NgTableParams) {

    $scope.myFiles = {};
    $scope.showMessage = false;

    $scope.uploadFiles = function () {

        $scope.uploading = true;
        var files = $scope.myFiles;

        contractFileService.uploadFilesToUrl(files)
          .then(function (response) {
            if (response.data.success) {
              $scope.success = true;
              $scope.uploading = false;
              $scope.showMessage = true;
              // $scope.uploadedFiles = response.data.files;
              $scope.message = response.data.message;
              $scope.fileCount += response.data.files;
              $scope.myFile = {};

              var date = new Date();
              var dt = date.getDate() + "/" + (date.getMonth()+1)  + "/" + date.getFullYear() + " @ "
                + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

              $scope.lastUploaded = dt;

              // processFiles();
              $scope.displayFiles();
              $scope.displayContracts();

            } else {
              $scope.success = false;
              $scope.showMessage = true;
              $scope.uploading = false;
              $scope.message = response.data.message;
              $scope.myFile = {};
            }
          }, function (error) {
            $scope.uploading = false;
            $scope.showMessage = true;
            $scope.message = 'An error has occurred';
          });
    };

    $scope.displayFiles = function() {
      contractFileService.getFiles()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.showFilesTable = true;
            $scope.allFiles = response.data;
            $scope.table = $scope.allFiles;
            // console.log(response.data[0].file._id);
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

        }, function(error) {
          console.log(error);
        });
    };

    $scope.displayContracts = function() {
      contractFileService.getContracts()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.allContracts = response.data;
            $scope.contracts = $scope.allContracts;
            $scope.showContractsTable = true;
          } else {
            $scope.showContractsTable = false;
            $scope.contractsMessage = "No contracts to display";
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.deleteFile = function(fileId) {
      contractFileService.deleteFile(fileId)
        .then(function(response) {
          if (response.data.success) {
            $scope.displayFiles();
            $scope.displayContracts();
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.deleteContract = function(contractId) {
      contractFileService.deleteContract(contractId)
        .then(function(response) {
          if (response.data.success) {
            $scope.displayFiles();
            $scope.displayContracts();
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.searchContracts = function() {
      if ($scope.contractSearch === "") {
        $scope.contracts = $scope.allContracts;
      } else{
        var contractName = $scope.contractSearch;
        var currentTable = $scope.allContracts;
        var newTable = [];
        for (var i=0; i<currentTable.length; i++) {
          if ((currentTable[i].organization !== undefined) && (currentTable[i].organization.toLowerCase().includes(contractName.toLowerCase()))) {
            newTable.push(currentTable[i]);
          }
        }
        $scope.contracts = newTable;
      }
    }

});
