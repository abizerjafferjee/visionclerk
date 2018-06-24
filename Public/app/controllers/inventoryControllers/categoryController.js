userApp.controller('categoryController', function($scope, inventoryService, NgTableParams, $routeParams) {

  $scope.category_id = $routeParams.category_id;

  $scope.getCategory = function() {
    inventoryService.getCategory($scope.category_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.categoryName = response.data.data.category;
        $scope.industryName = response.data.data.industry;
        $scope.content = response.data.data.content;
        // $scope.products = response.data.data.products;
      }
    });
  };

  $scope.getCategory();

  $scope.getProducts = function() {
    inventoryService.getProductsByCatId($scope.category_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.products = response.data.data;
      } else {
        $scope.showMessage = "No products";
      }
    });
  };

  $scope.getProducts();


});
