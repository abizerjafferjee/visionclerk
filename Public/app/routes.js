
userApp.config(function($routeProvider, $locationProvider, $compileProvider){
  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/)
  $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(true);
  $routeProvider

  .when('/', {
    templateUrl: 'app/views/pages/home.html',
    access: {restricted: false}
  })

  .when('/admin/register', {
    templateUrl : 'app/views/pages/users/adminregister.html',
    controller : 'adminController',
    access: {restricted: false}
  })

  .when('/register', {
    templateUrl : 'app/views/pages/users/register.html',
    controller : 'registerController',
    access: {restricted: false}
  })

  .when('/login', {
    templateUrl : 'app/views/pages/users/login.html',
    controller: 'loginController',
    access: {restricted: false}
  })

  .when('/logout', {
    controller: 'logoutController',
    access: {restricted: true}
  })

  .when('/forgotPassword', {
    templateUrl: 'app/views/pages/users/reset/forgotPassword.html',
    controller: 'forgotPasswordController',
    access: {restricted: false}
  })

  .when('/reset/:token', {
    templateUrl: 'app/views/pages/users/reset/resetPassword.html',
    controller: 'resetPasswordController',
    access: {restricted: false}
  })

  .when('/data/portal', {
    templateUrl: 'app/views/pages/data/portal.html',
    controller: 'dataController',
    access: {restricted: true}
  })

  .when('/data/contracts', {
    templateUrl: 'app/views/pages/data/contract.html',
    controller: 'contractFileController',
    access: {restricted: true}
  })

  .when('/data/invoices', {
    templateUrl: 'app/views/pages/data/invoice.html',
    controller: 'invoiceFileController',
    access: {restricted: true}
  })

  .when('/data/spend', {
    templateUrl: 'app/views/pages/data/spend.html',
    controller: 'spendController',
    access: {restricted: true}
  })

  .when('/profile', {
    templateUrl: 'app/views/pages/profile.html',
    controller: 'accountController',
    access: {restricted: true}
  })

  .when('/about', {
    templateUrl: 'app/views/pages/about.html',
    access: {restricted: false}
  })

  .when('/contact', {
    templateUrl: 'app/views/pages/contact.html',
    access: {restricted: false}
  })

  .when('/inventory', {
    templateUrl: 'app/views/pages/inventory/inventoryManager.html',
    controller: 'inventoryController',
    access: {restricted: true}
  })

  .when('/categories', {
    templateUrl: 'app/views/pages/inventory/categories.html',
    controller: 'consoleController',
    access: {restricted: true}
  })

  .when('/categories/:category_id', {
    templateUrl: 'app/views/pages/inventory/category.html',
    controller: 'categoryController',
    access: {restricted: true}
  })

  .when('/products/:product_id', {
    templateUrl: 'app/views/pages/inventory/product.html',
    controller: 'productController',
    access: {restricted: true}
  })

  .when('/inventory/category/update/:category_id', {
    templateUrl: 'app/views/pages/inventory/updateCategory.html',
    controller: 'updateCategoryController',
    access: {restricted: true}
  })

  .when('/inventory/product/update/:product_id', {
    templateUrl: 'app/views/pages/inventory/updateProduct.html',
    controller: 'updateProductController',
    access: {restricted: true}
  })


  .when('/inventory/category/create', {
    templateUrl: 'app/views/pages/inventory/createCategory.html',
    access: {restricted: true}
  })

  .when('/inventory/product/create', {
    templateUrl: 'app/views/pages/inventory/createProduct.html',
    access: {restricted: true}
  })

  .when('/analytics/supplier', {
    templateUrl: 'app/views/pages/analytics/supplier.html',
    access: {restricted: true},
    controller: 'supplierAnalyticsController'
  })

  .when('/analytics/insights', {
    templateUrl: 'app/views/pages/analytics/insights.html',
    access: {restricted: true},
    controller: 'insightsAnalyticsController'
  })

  .when('/analytics/insights/duplicatespend', {
    templateUrl: 'app/views/pages/analytics/insights/duplicateSpend.html',
    access: {restricted: true},
    controller: 'duplicateSpendController'
  })

  .when('/analytics/insights/highGrowthSpend', {
    templateUrl: 'app/views/pages/analytics/insights/highgrowth.html',
    access: {restricted: true},
    controller: 'highGrowthController'
  })

  .when('/analytics/insights/outlierTransactions', {
    templateUrl: 'app/views/pages/analytics/insights/outlierTransactions.html',
    access: {restricted: true},
    controller: 'outlierTransactionsController'
  })

  .when('/analytics/category', {
    templateUrl: 'app/views/pages/analytics/category.html',
    access: {restricted: true},
    controller: 'categoryAnalyticsController'
  })

  //category analytics pages
  .when('/analytics/category/:categoryname', {
    templateUrl: 'app/views/pages/analytics/categories/categorytable.html',
    access: {restricted: true},
    controller: 'categoryTableController'
  })

  //each supplier page
  .when('/analytics/suppliers/:suppliername', {
    templateUrl: 'app/views/pages/analytics/suppliers/supplier.html',
    access: {restricted: true},
    controller: 'supplierController'
  })

  .otherwise({
    redirectTo: '/',
    access: {restricted: false}
  });

});
