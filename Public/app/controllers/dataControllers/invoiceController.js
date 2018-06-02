userApp.controller('invoiceFileController', function($scope, invoiceFileService, NgTableParams) {

  $scope.invoiceTable = {};
  $scope.invoices = {};
  $scope.showMessage = false;

  $scope.uploadFiles = function () {

      $scope.uploading = true;
      var files = $scope.invoices;

      invoiceFileService.uploadFilesToUrl(files)
        .then(function (response) {
          if (response.data.success) {
            $scope.success = true;
            $scope.uploading = false;
            $scope.showMessage = true;
            $scope.message = response.data.message;
            $scope.fileCount += response.data.files;
            $scope.invoices = {};

            var date = new Date();
            var dt = date.getDate() + "/" + (date.getMonth()+1)  + "/" + date.getFullYear() + " @ "
              + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            $scope.lastUploaded = dt;

            // processFiles();
            $scope.displayFiles();
            // $scope.displayContracts();

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

  $scope.processFiles = function() {

    invoiceFileService.processFiles()
    .then(function(response) {
      if (response.data.success) {
        $scope.showProcessMessage = true;
        $scope.processMessage = "processed";
      }

    });

  };

  $scope.displayFiles = function() {
    invoiceFileService.getFiles()
      .then(function(response) {
        if (response.data.length !== 0) {
          $scope.showFilesTable = true;
          $scope.allFiles = response.data;
          $scope.table = $scope.allFiles;
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

  $scope.displayInvoices = function() {
    invoiceFileService.getInvoices()
      .then(function(response) {
        if (response.data.length !== 0) {
          $scope.showInvoicesTable = true;
          // $scope.invoiceTable = response.data;

          console.log(response.data);

          $scope.invoiceTable = new NgTableParams({}, { dataset: response.data });

        } else {
          $scope.showInvoicesTable = false;
          $scope.invoicesMessage = "No contracts to display";
        }
      }, function(error) {
        console.log(error);
      });
  };

  $scope.editInvoice = function(newInvoice) {
    console.log(newInvoice);
    invoiceFileService.editInvoice(newInvoice)
      .then(function(response) {
        console.log(response);
      }, function(error) {
        console.log(error);
      });
  };

  $scope.feedback = function(invoiceId, field) {

    invoiceFileService.sendFeedback(invoiceId, field)
      .then(function(response) {
        console.log(response);
      }, function(error) {
        console.log(error);
      });

  };





});
