userApp.controller('consoleController', function($scope, inventoryService, NgTableParams) {


  $scope.getCategories = function() {
    // Calls the getCategories function in the inventoryService
    inventoryService.getCategories()
    .then(function(response) {
      if (response.data.success) {
        $scope.categoryTable = new NgTableParams({}, { dataset: response.data.categories });
      }
    });
  };

});
