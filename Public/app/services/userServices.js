var userServices = angular.module('userServices', []);

userServices.factory('User', function($http) {
  userFactory = {};

  //User.create(regData);
  userFactory.create = function(regData) {
    return $http.post('/api/users', regData);
  }

  // User.activateAccount(token);
  userFactory.activateAccount = function(token) {
    return $http.put('/api/activate/' + token);
  }
  
  return userFactory;
});
