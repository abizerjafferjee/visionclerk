userApp.controller('invoiceFileController', function($scope, invoiceFileService, accountsPayableFileService, NgTableParams, $interval) {

  $scope.invoiceTable = {};
  $scope.invoices = {};
  $scope.showMessage = false;
  $scope.unprocessedInvoices = 0;
  var promise;

  $scope.typeOfFileUploaded = function() {
    if (document.getElementById("invoiceRadio").checked == true) {
      // uploadFiles() is called if Invoice is uploaded, which are
      // documents of the file extensions: PDF, PNG, HTML, Word
      $scope.uploadFiles();
    } else {
      // uploadFilesAccountsPayable() is called if Accounts Payable
      // document is uploaded, of the file extensions: xlsx (Excel)
      $scope.uploadFilesAccountsPayable();
    }
  };

  $scope.uploadFiles = function () {

      $scope.uploading = true;
      $scope.uploadSuccess = false;
      $scope.uploadFail = false;

      var files = $scope.invoices;

      invoiceFileService.uploadFilesToUrl(files)
        .then(function (response) {
          if (response.data.success) {
            $scope.uploading = false;
            $scope.uploadSuccess = true;
            $scope.uploadSuccessMessage = response.data.message;
            $scope.invoiceCount += response.data.files;
            $scope.invoices = {};

            $scope.getUnvalidatedInvoices();
            $scope.getInvoices();

          } else {
            $scope.uploading = false;
            $scope.uploadFail = true;
            $scope.uploadFailMessage = response.data.message;
            $scope.invoice = {};
          }
        }, function (error) {
          $scope.uploading = false;
          $scope.showMessage = true;
          $scope.message = 'An error has occurred';
        });
  };

  var processInvoices = function() {
    console.log("processing invoices");
    $scope.showProcessMessage = false;
    invoiceFileService.processInvoices()
    .then(function(response) {
      console.log(response);
      if (response.data.success) {
        $scope.unprocessedInvoices = response.data.notProcessed;
        $scope.getUnvalidatedInvoices();
      } else {
        $scope.showProcessMessage = true;
        $scope.processMessage = "Something went wrong. Please reload page";
      }
    });
  };

  $scope.startInvoiceProcessing = function() {
    // stops any running interval to avoid two intervals running at the same time
    $scope.stopInvoiceProcessing();
    promise = $interval(processInvoices, 12000);
  };

  $scope.stopInvoiceProcessing = function() {
    $interval.cancel(promise);
  };

  $scope.getInvoices = function() {
    invoiceFileService.getInvoices()
    .then(function(response) {
      $scope.startInvoiceProcessing();
      $scope.invoiceCount = response.data.length;
      if (response.data.length !== 0) {
        $scope.showInvoices = true;
        $scope.invoiceTable = new NgTableParams({}, { dataset: response.data });
        $scope.accountsPayable = response.data;
      } else {
        $scope.showInvoices = false;
        $scope.invoicesMessage = "No contracts to display";
      }
    }, function(error) {
      $scope.showInvoices = false;
      $scope.invoicesMessage = "Something went wrong";
    });
  };

  $scope.getUnvalidatedInvoices = function() {
    invoiceFileService.getUnvalidatedInvoices()
    .then(function(response) {
      $scope.unvalidatedInvoiceCount = response.data.length;
      if (response.data.length !== 0) {
        $scope.showUnvalidatedInvoices = true;
        $scope.unvalidatedInvoiceTable = new NgTableParams({}, { dataset: response.data });
        if ($scope.unprocessedInvoices == 0) {
          $scope.stopInvoiceProcessing();
        }
      } else {
        $scope.showUnvalidatedInvoices = false;
        $scope.unvalidatedInvoicesMessage = "All invoices validated";
        if ($scope.unprocessedInvoices == 0) {
          $scope.stopInvoiceProcessing();
        }
      }
    }, function(error) {
      $scope.showUnvalidatedInvoices = false;
      $scope.unvalidatedInvoicesMessage = "All invoices validated";
    });
  };

  $scope.updateInvoice = function(invoice) {
    invoiceFileService.editInvoice(invoice)
      .then(function(response) {
        console.log(response);
      }, function(error) {
        console.log(error);
      });
  };

  $scope.validateInvoice = function(invoiceId) {
    invoiceFileService.validateInvoice(invoiceId)
      .then(function(response) {
        $scope.getInvoices();
        $scope.getUnvalidatedInvoices();
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

  // $scope.processFilesAccountsPayable = function() {
  //
  //   invoiceFileService.processFiles()
  //   .then(function(response) {
  //     if (response.data.success) {
  //       $scope.showProcessMessageAccountsPayable = true;
  //       $scope.processMessageAccountsPayable = "processed";
  //       $scope.getUnvalidatedInvoices();
  //     }
  //   });
  // };


  // $scope.displayFilesAccountsPayable = function() {
  //   invoiceFileService.getFiles()
  //     .then(function(response) {
  //       if (response.data.length !== 0) {
  //         $scope.showFilesTable = true;
  //         $scope.allFiles = response.data;
  //         $scope.table = $scope.allFiles;
  //         $scope.fileCount = response.data.length;
  //
  //         $scope.filesTable = new NgTableParams({}, { dataset: response.data });
  //
  //         // set last uploaded date
  //         var dt = new Date(response.data[0].date);
  //         for (var i=0; i<response.data.length; i++) {
  //           var nextDt = new Date(response.data[i].date);
  //           if (dt < nextDt) {
  //             dt = nextDt;
  //           }
  //         }
  //         $scope.lastUploadedAccountsPayable = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear() + " @ "
  //           + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
  //
  //       } else {
  //         $scope.showFilesTable = false;
  //         $scope.filesMessage = "No files to display";
  //         $scope.fileCountAccountsPayable = 0;
  //       }
  //
  //     }, function(error) {
  //       console.log(error);
  //     });
  // };

  // $scope.uploadFilesAccountsPayable = function () {
  //     //console.log("Accounts Payable true!");
  //     $scope.uploadingAccountsPayable = true;
  //     var files = $scope.invoices;
  //
  //     accountsPayableFileService.uploadFilesToUrl(files)
  //       .then(function (response) {
  //         if (response.data.success) {
  //           $scope.successAccountsPayable = true;
  //           $scope.uploadingAccountsPayable = false;
  //           $scope.showMessageAccountsPayable = true;
  //           $scope.message = response.data.message;
  //           $scope.fileCountAccountsPayable += response.data.files;
  //           $scope.invoices = {};
  //
  //           var date = new Date();
  //           var dt = date.getDate() + "/" + (date.getMonth()+1)  + "/" + date.getFullYear() + " @ "
  //             + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  //
  //           $scope.lastUploadedAccountsPayable = dt;
  //
  //           // processFiles();
  //           $scope.displayFilesAccountsPayable();
  //           $scope.getUnvalidatedInvoices();
  //           $scope.getInvoices();
  //
  //         } else {
  //           $scope.successAccountsPayable = false;
  //           $scope.showMessageAccountsPayable = true;
  //           $scope.uploadingAccountsPayable = false;
  //           $scope.message = response.data.message;
  //           $scope.myFile = {};
  //         }
  //       }, function (error) {
  //         $scope.uploadingAccountsPayable = false;
  //         $scope.showMessageAccountsPayable = true;
  //         $scope.message = 'An error has occurred';
  //       });
  // };

});
