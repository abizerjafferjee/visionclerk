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

  .when('/upload', {
    templateUrl: 'app/views/pages/uploads.html',
    controller: 'fileUploadController',
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

  // .when('/search', {
  //   templateUrl : 'app/views/pages/search.html',
  //   controller : 'searchCtrl',
  //   controllerAs : 'search'
  // })
  //
  // .when('/results', {
  //   templateUrl : 'app/views/pages/users/search_results.html',
  //   controller : 'searchCtrl',
  //   controllerAs : 'search_results'
  // })

  // .when('/profile', {
  //   templateUrl : 'app/views/pages/users/profile.html'
  // })
  //
  // .when('/displaycase', {
  //   templateUrl : 'app/views/pages/users/displayCase.html',
  //   controller : 'searchCtrl',
  //   controllerAs : 'search'
  // })
  //
  // .when('/displaycase/:case_id', {
  //   templateUrl : 'app/views/pages/users/displayCase.html',
  //   controller : 'searchCtrl',
  //   controllerAs : 'search'
  // })
  //
  // .when('/activate/:token', {
  //   templateUrl : 'app/views/pages/users/activation/activate.html',
  //   controller : 'emailCtrl',
  //   controllerAs : 'email',
  //   authenticate : false
  // })
  //
  // .when('/resend', {
  //   templateUrl : 'app/views/pages/users/activation/resend.html',
  //   controller : 'resendCtrl',
  //   controllerAs : 'resend',
  //   authenticate : false
  // })
  //
  // .when('/resetusername', {
  //   templateUrl : 'app/views/pages/users/reset/reset_username.html',
  //   controller : 'resetusernameCtrl',
  //   controllerAs : 'resetusername',
  //   authenticated : false
  // })
  //
  // .when('/resetpassword', {
  //   templateUrl : 'app/views/pages/users/reset/reset_password.html',
  //   controller : 'resetpasswordCtrl',
  //   controllerAs : 'resetpassword',
  //   authenticate : false
  // })
  //
  // .when('/newpassword/:token', {
  //   templateUrl : 'app/views/pages/users/reset/newpassword.html',
  //   controller : 'newpasswordCtrl',
  //   controllerAs : 'newpassword',
  //   authenticate : false
  // })
  //
  // .when('/deleteaccount', {
  //   templateUrl : 'app/views/pages/users/activation/delete_account.html',
  //   controller : 'deleteaccountCtrl',
  //   controllerAs : 'deleteaccount',
  //   authenticate : false
  // })
