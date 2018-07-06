userApp.controller('productController', function($scope, inventoryService, NgTableParams, $routeParams) {

  $scope.product_id = $routeParams.product_id;

  $scope.getProduct = function() {
    inventoryService.getProduct($scope.product_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.product = response.data.data;
      }
    });
  };

  $scope.getProduct();

  // $scope.getProducts = function() {
  //   inventoryService.getProductsByCatId($scope.category_id)
  //   .then(function(response) {
  //     if (response.data.success) {
  //       $scope.products = response.data.data;
  //     } else {
  //       $scope.showMessage = "No products";
  //     }
  //   });
  // };
  //
  // $scope.getProducts();


});
