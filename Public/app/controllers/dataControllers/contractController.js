// POST Data
// GET Data
// PUT Data
// GET data
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
              $scope.message = response.data.message;
              $scope.fileCount += response.data.files;
              $scope.myFile = {};

              var date = new Date();
              $scope.lastUploaded = date.getDate() + "/" + (date.getMonth()+1)  + "/" + date.getFullYear() + " @ "
                + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

              $scope.getFiles();
              $scope.getUnvalidatedContracts();
              $scope.getContracts();

            } else {
              $scope.success = false;
              $scope.uploading = false;
              $scope.showMessage = true;
              $scope.message = response.data.message;
              $scope.myFile = {};
            }
          }, function (error) {
            $scope.success = false;
            $scope.uploading = false;
            $scope.showMessage = true;
            $scope.message = 'An error has occurred';
            $scope.myFile = {};
          });
    };

    // gets files from server
    // sets files, filecount, lastupdated
    // uses displayFiles functio to set files table
    $scope.getFiles = function() {
      contractFileService.getFiles()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.files = response.data;
            $scope.showFiles = true;
            $scope.fileCount = response.data.length;

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

            displayFiles();

          } else {
            $scope.files = [];
            $scope.showFiles = false;
            $scope.filesMessage = "No files to display";
            $scope.fileCount = 0;
          }
        }, function(error) {
          $scope.files = [];
          $scope.showFiles = false;
          $scope.filesMessage = "No files to display";
          $scope.fileCount = 0;
        });
    };

    // creates a new array of data for ngtable
    function displayFiles() {
      var filesDf = [];
      for (var i=0; i<$scope.files.length; i++) {
        var file = {
          id: $scope.files[i]._id,
          fileName: $scope.files[i].originalName,
          date: $scope.files[i].date,
          processed: $scope.files[i].processedFile.contract.extracted,
          contractId: $scope.files[i].processedFile.contract.fileRef
        };
        filesDf.push(file);
      }

      $scope.filesTable = new NgTableParams({}, { dataset: filesDf });

    };

    // gets contracts from server
    // sets contracts
    // uses displayContracts function to create contracts table
    $scope.getContracts = function() {
      contractFileService.getContracts()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.contracts = response.data;
            $scope.showContracts = true;
            displayContracts();
          } else {
            $scope.showContracts = false;
            $scope.contractsMessage = "No contracts to display";
          }
        }, function(error) {
          $scope.showContracts = false;
          $scope.contractsMessage = "No contracts to display";
        });
    };

    // creates a new array of contract data for ngtables
    function displayContracts() {
      var contractsDf = [];
      for (var i=0; i<$scope.contracts.length; i++) {
        var contract = {
          id: $scope.contracts[i]._id,
          organization: $scope.contracts[i].organization,
          party: $scope.contracts[i].party,
          item: $scope.contracts[i].item,
          quantity: $scope.contracts[i].quantity,
          identifier: $scope.contracts[i].identifier,
          events: $scope.contracts[i].events,
          other: $scope.contracts[i].other,
          fileRef: $scope.contracts[i].originalFile.fileRef,
          fileName: $scope.contracts[i].originalFile.fileName
        };
        contractsDf.push(contract);
      }

      $scope.contractsTable = new NgTableParams({}, { dataset: contractsDf });

    };

    // gets contracts from server
    // sets contracts
    // uses displayContracts function to create contracts table
    $scope.getUnvalidatedContracts = function() {
      contractFileService.getUnvalidatedContracts()
        .then(function(response) {
          if (response.data.length !== 0) {
            $scope.unvalidatedContracts = response.data;
            $scope.showUnvalidatedContracts = true;
            $scope.unvalidatedContractsTable = new NgTableParams({}, { dataset: $scope.unvalidatedContracts});

          } else {
            $scope.showUnvalidatedContracts = false;
            $scope.unvalidatedContractsMessage = "All Contracts Validated";
          }
        }, function(error) {
          $scope.showUnvalidatedContracts = false;
          $scope.unvalidatedContractsMessage = "All Contracts Validated";
        });
    };

    $scope.validateContract = function(contractId) {
      contractFileService.validateContract(contractId)
        .then(function(response) {
          if (response.data.success) {
            $scope.getUnvalidatedContracts();
            $scope.getContracts();
          } else {
            console.log(response);
          }
        }, function(error) {
          console.log(error);
        });
    };

    $scope.save = function(contract) {
      contractFileService.editContract(contract)
        .then(function(response) {
          if (response.data.success) {
            $scope.getUnvalidatedContracts();
          } else {
            console.log(response);
          }
        }, function(error) {
          console.log(error);
        });
    };

    $scope.deleteFile = function(fileId) {
      contractFileService.deleteFile(fileId)
        .then(function(response) {
          if (response.data.success) {
            $scope.getFiles();
            $scope.getContracts();
            $scope.getUnvalidatedContracts();
          }
        }, function(error) {
          console.log(error);
        });
    }

    $scope.deleteContract = function(contractId) {
      contractFileService.deleteContract(contractId)
        .then(function(response) {
          if (response.data.success) {
            $scope.getFiles();
            $scope.getContracts();
            $scope.getUnvalidatedContracts();
          }
        }, function(error) {
          console.log(error);
        });
    }

});
