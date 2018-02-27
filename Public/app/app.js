var userApp = angular.module('userApp', ['appRoutes', 'searchControllers', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'emailController']);

userApp.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptors');
});
