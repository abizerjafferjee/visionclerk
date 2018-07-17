
userApp.controller('categoryTableController', function ($scope, spendAnalyticsService, NgTableParams, $routeParams) {

  $scope.pageTitle = $routeParams.categoryname;

  $scope.byCategory = function() {
    spendAnalyticsService.byCategory($routeParams.categoryname)
    .then(function(response) {
       var data = response.data.data;
       $scope.suppliers = data.length;
       $scope.spend = 0;
       $scope.transactions = 0;
       for (var i=0; i<data.length; i++) {
         $scope.spend += data[i].spend;
         $scope.transactions += data[i].transactions;
       }
       $scope.categoryTable = new NgTableParams({}, { dataset: data });
       $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.byCategory();

  $scope.spendOvertimePerCategory = function() {
    spendAnalyticsService.spendOvertimePerCategory($routeParams.categoryname)
    .then(function(response) {

      var data = response.data.data;

      var suppliers = {
        x: [],
        y: [],
        type: 'bar',
        name: 'Suppliers',
        marker: {
          color: 'rgb(49,130,189)',
          opacity: 0.7,
        }
      };

      var transactions = {
        x: [],
        y: [],
        type: 'bar',
        name: 'Transactions',
        marker: {
          color: 'rgb(204,204,204)',
          opacity: 0.5
        }
      };

      var spend = {
        x: [],
        y: [],
        type: 'line',
        name: 'Spend',
        yaxis: 'y2',
        marker: {
          color: 'rgb(0,204,204)',
          opacity: 0.5,
          size: 12
        }
      };

      for (var i=0; i<data.length; i++) {
        suppliers.x.push(data[i].post_year);
        transactions.x.push(data[i].post_year);
        spend.x.push(data[i].post_year);
        suppliers.y.push(data[i].vendors);
        transactions.y.push(data[i].transactions);
        spend.y.push(data[i].spend);
      }

      var vis = [suppliers, transactions, spend];

      var layout = {
        title: 'Spend, Suppliers and Transactions',
        xaxis: {
          title: 'Year',
          tickangle: -45
        },
        yaxis2: {
          title: 'Spend',
          titlefont: {color: 'rgb(148, 103, 189)'},
          tickfont: {color: 'rgb(148, 103, 189)'},
          overlaying: 'y',
          side: 'right'
        },
        barmode: 'group'
      };

      Plotly.newPlot('spendOvertimePerCategory', vis, layout);

    });
  };

  $scope.spendOvertimePerCategory();

});

// userApp.controller('highGrowthController', function ($scope, spendAnalyticsService, NgTableParams) {
//
//   $scope.highSpendLastMonth = function() {
//     spendAnalyticsService.highSpendLastMonth()
//     .then(function(response) {
//        var data = response.data.data[2];
//        console.log(data);
//
//        var totalSpend = 0;
//        var numDiscovered = data.length;
//
//        for (var i=0; i<data.length; i++) {
//          totalSpend += data[i].amount2;
//        }
//
//        $scope.Table = new NgTableParams({}, { dataset: data });
//        $scope.highGrowthAmount = Math.round(totalSpend);
//        $scope.highGrowthDiscovered = numDiscovered;
//     })
//   };
//
//   $scope.highSpendLastMonth();
//
// });
//
// userApp.controller('outlierTransactionsController', function ($scope, spendAnalyticsService, NgTableParams) {
//
//   $scope.outlierTransactions = function() {
//     spendAnalyticsService.outlierTransactions()
//     .then(function(response) {
//        var data = response.data.data;
//        console.log(data);
//
//        var totalSpend = 0;
//        var numDiscovered = data.length;
//
//        for (var i=0; i<data.length; i++) {
//          totalSpend += data[i].invoice_amount;
//        }
//
//        $scope.Table = new NgTableParams({}, { dataset: data });
//        $scope.outlierTransactionsAmount = Math.round(totalSpend);
//        $scope.outlierTransactionsDiscovered = numDiscovered;
//     })
//   };
//
//   $scope.outlierTransactions();
//
//   $scope.extractDate = function(date) {
//     var dt = new Date(date);
//     var parsed = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear();
//     return parsed;
//   };
//
// });
