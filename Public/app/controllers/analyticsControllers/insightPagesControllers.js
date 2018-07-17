
userApp.controller('duplicateSpendController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.duplicateSpend = function() {
    spendAnalyticsService.duplicateSpend()
    .then(function(response) {
       var data = response.data.data
       console.log(data);

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         if (data[i].spend !== null) {
           totalSpend += data[i].spend;
         }
       }

       $scope.duplicateSpendAmount = totalSpend;
       $scope.duplicatesDiscovered = numDiscovered;

       $scope.Table = new NgTableParams({}, { dataset: data });
    })
  };

  $scope.duplicateSpend();

});

userApp.controller('highGrowthController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.highSpendLastMonth = function() {
    spendAnalyticsService.highSpendLastMonth()
    .then(function(response) {
       var data = response.data.data[2];
       console.log(data);

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         totalSpend += data[i].amount2;
       }

       $scope.Table = new NgTableParams({}, { dataset: data });
       $scope.highGrowthAmount = Math.round(totalSpend);
       $scope.highGrowthDiscovered = numDiscovered;
    })
  };

  $scope.highSpendLastMonth();

});

userApp.controller('outlierTransactionsController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.outlierTransactions = function() {
    spendAnalyticsService.outlierTransactions()
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         totalSpend += data[i].invoice_amount;
       }

       $scope.Table = new NgTableParams({}, { dataset: data });
       $scope.outlierTransactionsAmount = Math.round(totalSpend);
       $scope.outlierTransactionsDiscovered = numDiscovered;
    })
  };

  $scope.outlierTransactions();

  $scope.extractDate = function(date) {
    var dt = new Date(date);
    var parsed = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear();
    return parsed;
  };

});
