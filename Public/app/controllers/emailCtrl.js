var emailController = angular.module('emailController', []);

emailController.controller('emailCtrl', function($routeParams) {
  console.log($routeParams.token);

  //User.activateAccount(token);
});
