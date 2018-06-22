userApp.controller('updateProductController', function ($scope, inventoryService, NgTableParams, $routeParams) {

  $scope.product_id = $routeParams.product_id;

  $scope.getProduct = function() {
    $scope.productForm = {};
    inventoryService.getProduct($scope.product_id)
    .then(function(response){
      if (response.data.success) {
        $scope.productData = response.data.data;

        $scope.productForm.company = response.data.data.company;
        $scope.productForm.logo = response.data.data.logo;
        $scope.productForm.companydesc = response.data.data.company_desc;
        $scope.productForm.product = response.data.data.product;
        $scope.productForm.img = response.data.data.product_img;
        $scope.productForm.content = response.data.data.content;
        $scope.productForm.category = response.data.data.category;
        $scope.productForm.industry = response.data.data.industry;


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

  $scope.getProducts = function() {
    inventoryService.getProducts()
      .then(function(response) {
        if (response.data.success) {
          $scope.allCompanies = response.data.data.map(x => x['company']);
          $scope.allProducts = response.data.data.map(x => x['product']);
        }
      });
  };

  $scope.getProducts();

  $scope.updateProduct = function() {

    var newProduct = {
      company: $scope.productForm.company,
      logo: $scope.productForm.logo,
      company_desc: $scope.productForm.companydesc,
      product: $scope.productForm.product,
      product_img: $scope.productForm.img,
      content: $scope.productForm.content,
      category: $scope.productForm.category,
      industry: $scope.productForm.industry,
    }

    inventoryService.updateProduct(newProduct, $scope.product_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.showProductMessage = true;
        $scope.productMessage = "Product Successfully Updated";
      } else {
        $scope.showProductError = true;
        $scope.productError = response.data.message;
      }
    });

  };

});
