userApp.controller('updateCategoryController', function ($scope, inventoryService, NgTableParams, $routeParams) {

  $scope.category_id = $routeParams.category_id;

  $scope.updateCategoryInitial = function() {
    $scope.categoryForm = {};
    inventoryService.getCategory($scope.category_id)
    .then(function(response){
      if (response.data.success) {
        $scope.categoryData = response.data.data;
        //console.log(response.data);
        $scope.categoryForm.category = response.data.data['category'];
        $scope.categoryForm.industry = response.data.data['industry'];
        $scope.categoryForm.content = response.data.data['content'];

      } else {
        // error handled here
        console.log(response.data.success);

      }

    });

  };

  $scope.getCategories = function() {

    inventoryService.getCategories()
    .then(function(response) {
      if (response.data.success) {
        $scope.allCategories = response.data.categories.map(x => x['category']);
        $scope.allIndustries = []
        for (var i=0; i<response.data.categories.length; i++) {
          if (!$scope.allIndustries.includes(response.data.categories[i]["industry"])) {
            $scope.allIndustries.push(response.data.categories[i]["industry"]);
          }
        }
      }

    });
  };

  $scope.getCategories();

  $scope.updateCategory = function() {

    var newCategory = {
      category: $scope.categoryForm.category,
      industry: $scope.categoryForm.industry,
      content: $scope.categoryForm.content,
    };

    inventoryService.updateCategory(newCategory, $scope.category_id)
    .then(function(response) {
      if (response.data.success){
        $scope.showMessage = true;
        $scope.message = "Category Successfully updated";

      } else {
        $scope.showError = true;
        $scope.error = response.data.message;
      }
    });

  };

});
