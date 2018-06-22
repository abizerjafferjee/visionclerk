
userApp.config(function($routeProvider, $locationProvider){
  $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(true);
  $routeProvider

  .when('/', {
    templateUrl: 'app/views/pages/home.html',
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

  .when('/contract', {
    templateUrl: 'app/views/pages/contract.html',
    controller: 'contractFileController',
    access: {restricted: true}
  })

  .when('/spend', {
    templateUrl: 'app/views/pages/invoice.html',
    controller: 'invoiceFileController',
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
