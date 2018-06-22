userApp.controller('inventoryController', function ($scope, inventoryService, NgTableParams) {


  $scope.createCategory = function() {
    $scope.showError = false;
    if ($scope.allCategories.includes($scope.categoryForm.category)) {
      $scope.showError = true;
      $scope.error = "Category already exists";
    } else {
      var newCategory = {category:$scope.categoryForm.category, industry: $scope.categoryForm.industry, content: $scope.categoryForm.content};
      inventoryService.createCategory(newCategory)
      .then(function(response) {
        if (response.data.success) {
          $scope.showMessage = true;
          $scope.message = "Category Successfully Created";
          $scope.categoryForm = {};
          $scope.getCategories();
        } else {
          $scope.showError = true;
          $scope.error = response.data.message;
          $scope.categoryForm = {};
        }
      });
    }
  };


  $scope.getCategories = function() {

    inventoryService.getCategories()
    .then(function(response) {
      if (response.data.success) {
        $scope.categoryData = response.data.categories;
        $scope.categoryTable = new NgTableParams({}, { dataset: response.data.categories });
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

  $scope.deleteCategory = function(category_id) {
    inventoryService.deleteCategory(category_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.getCategories();
      }
    });
  }

  $scope.createProduct = function() {

    getCategoryId = function() {
      for (var i=0; i<$scope.categoryData.length; i++) {
        if ($scope.categoryData[i]['category'] === $scope.productForm.category) {
          return $scope.categoryData[i]['_id'];
        }
      }
    };

    var newProduct = {
      company: $scope.productForm.company,
      logo: $scope.productForm.logo,
      company_desc: $scope.productForm.companydesc,
      product: $scope.productForm.product,
      product_img: $scope.productForm.img,
      content: $scope.productForm.content,
      category: $scope.productForm.category,
      industry: $scope.productForm.industry,
      category_id: getCategoryId()
    }

    inventoryService.createProduct(newProduct)
    .then(function(response) {
      if (response.data.success) {
        $scope.showProductMessage = true;
        $scope.productMessage = "Product Successfully Listed";
        $scope.productForm = {};
      } else {
        $scope.showProductError = true;
        $scope.productError = response.data.message;
        $scope.productForm = {};
      }
    });

  };

  $scope.getProducts = function() {
    inventoryService.getProducts()
      .then(function(response) {
        if (response.data.success) {
          $scope.productsData = response.data.data;
          $scope.productsTable = new NgTableParams({}, { dataset: response.data.data });
          $scope.allCompanies = response.data.data.map(x => x['company']);
          $scope.allProducts = response.data.data.map(x => x['product']);
        }
      });
  };

  $scope.getProducts();

  $scope.deleteProduct = function(product_id) {
    inventoryService.deleteProduct(product_id)
    .then(function(response) {
      if (response.data.success) {
        $scope.getProducts();
      }
    });
  }


});
