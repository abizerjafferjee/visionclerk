var emailController = angular.module('emailController', ['userServices']);

emailController.controller('emailCtrl', function($routeParams, User, $timeout, $location) {

  app = this;

  User.activateAccount($routeParams.token).then(function(data) {
    app.successMsg = false;
    app.errorMsg = false;

    if (data.data.success) {
      app.successMsg = data.data.message + '... Redirecting';
      $timeout(function() {
        $location.path('/login');
      }, 1000);
    } else {
      app.errorMsg = data.data.message + '... Redirecting';
      $timeout(function() {
        $location.path('/login');
      }, 5000);
    }
  });
})

.controller('resendCtrl', function(User) {
  app = this;

  app.checkCredentials = function (loginData) {
    app.disabled = true;
    app.errorMsg = false;
    app.successMsg = false;
    User.checkCredentials(app.loginData).then(function (data){
      if (data.data.success) {
        User.resendLink(app.loginData).then(function (data) {
          if (data.data.success){
            app.successMsg = data.data.message;
          }
        });
      } else {
        app.disabled = false;
        app.errorMsg = data.data.message;
      }
    })
  };

});
