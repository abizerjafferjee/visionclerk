var uc = angular.module('userControllers', ['userServices', ]);

uc.controller('regCtrl', function($http, $location, $timeout, User){

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
        }, 1000);
      } else {
        app.disabled = false;
        app.loading = false;
        //Create an error message
        app.errorMsg = data.data.message;
      }
    });
  };
});
