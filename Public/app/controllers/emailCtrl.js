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

})

.controller('resetusernameCtrl', function(User){
  app = this;

  app.sendUsername = function(userData, valid) {
    app.errorMsg = false;
    app.loading = true;
    app.disabled = true;

    if (valid) {
      User.sendUsername(app.userData.email).then(function(data) {
        app.loading = false;
        if (data.data.success) {
          app.successMsg = data.data.message;
        } else {
          app.disabled = false;
          app.errorMsg = data.data.message;
        }
      });
    } else {
      app.disabled = false;
      app.loading = false;
      app.errorMsg = 'Please enter a valid Email';
    }
  }
})

.controller('resetpasswordCtrl', function(User){
  app = this;

  app.sendPassword = function(resetData, valid) {
    app.errorMsg = false;
    app.loading = true;
    app.disabled = true;

    if (valid) {
      User.sendPassword(app.resetData).then(function(data) {
        app.loading = false;
        if (data.data.success) {
          app.successMsg = data.data.message;
        } else {
          app.disabled = false;
          app.errorMsg = data.data.message;
        }
      });
    } else {
      app.disabled = false;
      app.loading = false;
      app.errorMsg = 'Please enter a valid Email';
    }
  }
})

.controller('newpasswordCtrl', function(User, $routeParams) {

  app = this;
  app.hide = true;

  User.resetUserPassword($routeParams.token).then(function(data) {
    if (data.data.success) {
      app.hide = false;
      app.successMsg = 'Please enter a new password';
    } else {
      app.errorMsg = data.data.message;
    }
  });
});
