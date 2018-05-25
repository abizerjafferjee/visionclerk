var userApp = angular.module('userApp', ['ngRoute']);

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

  // $rootScope.user = function() {
  //   AuthService.getUserStatus()
  //     .then(function() {
  //       if (AuthService.isLoggedIn() === true) {
  //         $rootScope.isLoggedIn = true;
  //         return $window.sessionStorage.getItem("user")
  //       } else {
  //         $rootScope.isLoggedIn = false;
  //       }
  //     });
  // }

  // console.log($window.sessionStorage.getItem("user").userName);


}]);
