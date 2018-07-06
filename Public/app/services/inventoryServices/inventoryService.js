userApp.service('inventoryService', function ($http, $q) {

    this.createCategory = function (category) {
        var deffered = $q.defer();
        $http.post('/inventory/createCategory', {category: category}).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.getCategories = function () {
        var deffered = $q.defer();
        $http.get('/inventory/categories').then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.getCategory = function (category_id) {
        var deffered = $q.defer();
        $http.get('/inventory/categories/'+category_id).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.deleteCategory = function (category_id) {
        var deffered = $q.defer();
        $http.post('/inventory/deleteCategory', {id: category_id}).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.updateCategory = function (updatedCategory, category_id) {
      var deffered = $q.defer();
      $http.post('/inventory/updateCategory', {id: category_id, data: updatedCategory}).then(function (response){
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;

    };

    this.createProduct = function (product) {
        var deffered = $q.defer();
        $http.post('/inventory/createProduct', {data: product}).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.getProducts = function() {
      var deffered = $q.defer();
      $http.get('/inventory/products').then(function (response) {
          deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;
    };

    this.deleteProduct = function (product_id) {
        var deffered = $q.defer();
        $http.post('/inventory/deleteProduct', {id: product_id}).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.getProduct = function (product_id) {
        var deffered = $q.defer();
        $http.get('/inventory/products/'+product_id).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.getProductsByCatId = function (category_id) {
        var deffered = $q.defer();
        $http.get('/inventory/products/category/'+category_id).then(function (response) {
            deffered.resolve(response);
        }, function(error) {
          deffered.reject();
        });

        return deffered.promise;
    };

    this.updateProduct = function (updatedProduct, product_id) {
      var deffered = $q.defer();
      $http.post('/inventory/updateProduct', {id: product_id, data: updatedProduct}).then(function (response){
        deffered.resolve(response);
      }, function(error) {
        deffered.reject();
      });

      return deffered.promise;

    };


});
