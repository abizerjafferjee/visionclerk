userApp.controller('dataController', function($scope, dataService, NgTableParams) {

  $scope.getFiles = function() {
    dataService.getFiles()
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
      });
  };

  $scope.getFiles();

});
