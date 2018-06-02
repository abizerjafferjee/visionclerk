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

  .otherwise({
    redirectTo: '/',
    access: {restricted: false}
  });
});
