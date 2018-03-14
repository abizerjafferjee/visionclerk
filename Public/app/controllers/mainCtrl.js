var mainController = angular.module('mainController', ['authServices']);

mainController.controller('mainCtrl', function(Auth, $location, $timeout, $rootScope, $route, $scope){
  var app = this;

  app.loadme = false;
  var landing = localStorage.getItem('registering');
  if(landing == null){
    app.registering = true;
  } else if(landing == 1) {
    app.registering = true;
  } // if landing == 0 don't even create the flag because creating it shows it

  $rootScope.$on('$routeChangeStart', function(){
    if (Auth.isLoggedIn()){
      app.isLoggedIn = true;
      Auth.getUser().then(function(data){
        app.username = data.data.username;
        app.useremail = data.data.email;
        app.loadme = true;
      });
    } else {
      app.isLoggedIn = false;
      app.username = '';
      app.loadme = true;
    }
  });

  this.doLogin = function(loginData){
    app.loading = true;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

    Auth.login(app.loginData).then(function(data) {
      if (data.data.success) {
        app.loading = false;
        //create Success message
        app.successMsg = data.data.message;
        // redirect to home page
        $timeout(function(){
          $location.path('/search');
          app.loginData = '';
          app.successMsg = false;
        }, 1000);
      } else {
        // token expired
        if (data.data.expired) {
          app.expired = true;
          app.loading = false;
          app.errorMsg = data.data.message;
        } else {
          app.disabled = false;
          app.loading = false;
          app.errorMsg = data.data.message;
        }
      }
    });
  };

  this.logout = function() {
    Auth.logout();
    $location.path('/logout');
    $timeout(function(){
      $location.path('/')
    }, 1000);
  };

  this.showLanding = function() {
    localStorage.setItem('registering', 1);
    app.registering = true;
    //$route.reload();
  }

  this.doNOTshowLanding = function() {
    localStorage.setItem('registering', 0);
    app.registering = false;
    //$route.reload();
  };
});
