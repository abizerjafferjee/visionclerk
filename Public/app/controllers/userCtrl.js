var userControllers = angular.module('userControllers', ['userServices']);

userControllers.controller('regCtrl', function($http, $location, $timeout, User){

  var app = this;

  this.regUser = function(regData){
    app.disabled = true;
    app.loading = true;
    app.errorMsg = false;

    User.create(app.regData).then(function(data){
      if (data.data.success) {
        app.loading = false;
        //create Success message
        app.successMsg = data.data.message;
        // redirect to home page
        $timeout(function(){
          $location.path('/login');
        }, 2000);
      } else {
        app.disabled = false;
        app.loading = false;
        //Create an error message
        app.errorMsg = data.data.message;
      }
    });
  };
})

.controller('deleteaccountCtrl', function(User, $routeParams){

  app = this;

  app.deleteAccount = function(email) {
    app.errorMsg = false;
    app.loading = true;
    app.disabled = true;

    User.deleteAccount(email).then(function(data) {
      app.loading = false;
      if (data.data.success) {
        app.disabled = true;
        app.successMsg = data.data.message;
      } else {
        app.disabled = false;
        app.errorMsg = data.data.message;
      }
    });
  }
});
