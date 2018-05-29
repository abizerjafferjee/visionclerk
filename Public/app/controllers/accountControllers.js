userApp.controller('accountController', function ($scope, accountService) {

  $scope.displayProfile = function() {
    accountService.getUserProfile()
    .then(function(response) {
      if (response.data.success) {
        $scope.account = response.data.account;
      } else {
        $scope.showError = true;
        $scope.error = response.message;
      }
    });
  };

  $scope.updateProfile = function() {
    var account = {
      firstName: $scope.firstName,
      lastName: $scope.lastName,
      organizationName: $scope.organizationName,
      organizationRole: $scope.organizationRole,
      emailAddress: $scope.emailAddress,
      phoneNumber: $scope.phoneNumber
    }
    accountService.updateProfile(account, $scope.account._id)
      .then(function(response) {
        if (response.data.success) {
          $scope.showEditMessage = true;
          $scope.editMessage = response.data.message;
          $scope.displayProfile();
        } else {
          $scope.showEditMessage = true;
          $scope.editMessage = response.data.message;
        }
      });
  };

});
