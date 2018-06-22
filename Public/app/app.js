var userApp = angular.module('userApp', ['ngRoute', 'ngTable', 'textAngular']);

userApp.run(['$rootScope', '$location', '$route', 'AuthService', '$window', function($rootScope, $location, $route, AuthService, $window) {

  AuthService.setUsername();

  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    AuthService.getUserStatus()
    .then(function(){
      if (next.access.restricted && AuthService.isLoggedIn() === false) {
        $location.path('/login');
        $route.reload();
      }
    });
  });

}]);
