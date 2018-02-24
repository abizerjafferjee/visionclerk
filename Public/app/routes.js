var appRoutes = angular.module('appRoutes', ['ngRoute']);

appRoutes.config(function($routeProvider, $locationProvider){
  $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(true);
  $routeProvider

  .when('/search', {
    templateUrl : 'app/views/pages/search.html',
    controller : 'searchCtrl',
    controllerAs : 'search'
  })

  .when('/register', {
    templateUrl : 'app/views/pages/users/register.html',
    controller : 'regCtrl',
    controllerAs : 'register'
  })

  .when('/login', {
    templateUrl : 'app/views/pages/users/login.html'
  })

  .when('/logout', {
    templateUrl : 'app/views/pages/users/logout.html'
  })

  .when('/profile', {
    templateUrl : 'app/views/pages/users/profile.html'
  })

  .when('/displaycase', {
    templateUrl : 'app/views/pages/users/displayCase.html',
    controller : 'searchCtrl',
    controllerAs : 'search'
  })

  .when('/activate/:token', {
    templateUrl : 'app/views/pages/users/activation/activate.html',
    controller : 'emailCtrl',
    controllerAs : 'email'
  })

  .when('/resend', {
    templateUrl : 'app/views/pages/users/activation/resend.html',
    controller : 'resendCtrl',
    controllerAs : 'resend'
  })

  .otherwise({
    redirectTo: '/'
  });
});
