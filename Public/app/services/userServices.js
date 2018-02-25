var userServices = angular.module('userServices', []);

userServices.factory('User', function($http) {
  userFactory = {};

  //User.create(regData);
  userFactory.create = function(regData) {
    return $http.post('/api/users', regData);
  };

  // User.activateAccount(token);
  userFactory.activateAccount = function(token) {
    return $http.put('/api/activate/' + token);
  };

  //User.checkCredentials(loginData);
  userFactory.checkCredentials = function (loginData) {
    return $http.post('/api/resend', loginData);
  };

  // User.resendLink(username);
  userFactory.resendLink = function(email) {
    return $http.put('/api/resend', email)
  };

  // User.sendUsername(userData);
  userFactory.sendUsername = function(userData) {
    return $http.get('/api/resetusername/' + userData);
  };

  // User.sendPassword(resetData);
  userFactory.sendPassword = function(resetData) {
    return $http.put('/api/resetpassword', resetData);
  };

  // User.resetUserPassword(token);
  userFactory.resetUserPassword = function(token) {
    return $http.get('/api/resetpassword/' + token);
  }

  return userFactory;
});
