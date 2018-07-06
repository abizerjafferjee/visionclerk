userApp.factory('AuthService',
  ['$q', '$timeout', '$http', '$rootScope', '$window',
  function ($q, $timeout, $http, $rootScope, $window) {

    // create user variable
    var user = null;

    // return available functions for use in the controllers
    return ({
      adminRegister: adminRegister,
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register,
      forgotPassword: forgotPassword,
      resetPassword: resetPassword,
      setUsername: setUsername
    });

    function adminRegister(email, username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/admin/register',
        {email: email, username: username, password: password})
        // handle success & error
        .then(function (response) {
          if(response.status === 200 && response.data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function (error) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function isLoggedIn() {
      if(user) {
        return true;
      } else {
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/user/status')
      // handle success
      .then(function (response) {
        if(response.data.status){
          user = true;
        } else {
          user = false;
        }
      }, function(error) {
        user = false;
      });
    }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/login',
        {username: username, password: password})
        // handle success & error
        .then(function (response) {
          if(response.status === 200 && response.data.status){
            user = true;
            deferred.resolve(response);
          } else {
            user = false;
            deferred.reject();
          }
        }, function (error) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/user/logout')
        // handle success & error
        .then(function (response) {
          user = false;
          deferred.resolve();
        }, function (error) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function register(email, username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/register',
        {email: email, username: username, password: password})
        // handle success & error
        .then(function (response) {
          if(response.status === 200 && response.data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function (error) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function forgotPassword(email) {

      var deferred = $q.defer();

      $http.post('/user/forgot', {email: email})
        .then(function(response) {
          if(response.status === 200 && response.data.status) {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function(error) {
          deferred.reject();
        });

      return deferred.promise;

    }

    function resetPassword(locationPath, newPassword) {

      var deferred = $q.defer();

      var resetRoute = '/user' + locationPath;
      $http.post(resetRoute, {password: newPassword})
        .then(function(response) {
          if (response.status === 200 & response.data.status) {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function(error) {
          deferred.reject();
        });

      return deferred.promise;

    }

    function setUsername() {
      getUserStatus()
        .then(function() {
          if (isLoggedIn()) {
            $rootScope.user = $window.localStorage.getItem("username");
            $rootScope.showUser = true;
          }
        });
    }

}]);
