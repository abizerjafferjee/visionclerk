var userApp = angular.module('userApp', ['appRoutes', 'searchControllers', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices']);

userApp.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptors');
});
