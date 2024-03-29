userApp.controller('loginController',
  ['$scope', '$location', 'AuthService', '$window', '$rootScope',
  function ($scope, $location, AuthService, $window, $rootScope) {

    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        // handle success
        .then(function (response) {

          // set username in local storage and show user
          $window.localStorage.setItem("username", response.data.user.username);
          $rootScope.user = $window.localStorage.getItem("username");
          $rootScope.showUser = true;

          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Invalid username and/or password";
          $scope.disabled = false;
          $scope.loginForm = {};
        });

    };

}]);

userApp.controller('logoutController',
  ['$scope', '$location', 'AuthService', '$window', '$rootScope',
  function ($scope, $location, AuthService, $window, $rootScope) {

    $scope.logout = function () {

      // call logout from service
      AuthService.logout()
        .then(function () {
          // do not show user
          $rootScope.showUser = false;

          $location.path('/login');
        });
    };
}]);

userApp.controller('registerController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.email, $scope.registerForm.username, $scope.registerForm.password)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };

}]);

userApp.controller('forgotPasswordController', ['$scope', '$location', 'AuthService',
  function($scope, $location, AuthService) {

    $scope.forgotPassword = function() {

      $scope.error = false;
      $scope.success = false;
      $scope.disabled = true;

      AuthService.forgotPassword($scope.forgotForm.email)
        .then(function () {
          $scope.disabled = false;
          $scope.success = true;
          $scope.successMessage = "Instructions sent to your email";
          $scope.forgotForm = {};
        })
        .catch(function() {
          $scope.disabled = false;
          $scope.error = true;
          $scope.errorMessage = "No account with that email address exists";
        });
    };
}]);

userApp.controller('resetPasswordController', ['$scope', '$location', 'AuthService',
  function($scope, $location, AuthService) {

    $scope.resetPassword = function() {

      $scope.error = false;
      $scope.success = false;
      $scope.disabled = true;

      AuthService.resetPassword($location.$$path, $scope.resetForm.password)
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        .catch(function() {
          $scope.disabled = false;
          $scope.error = true;
          $scope.errorMessage = "Something went wrong";
        });
    };
}]);


userApp.controller('adminController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.adminRegister($scope.registerForm.email, $scope.registerForm.username, $scope.registerForm.password)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };

}]);
