userApp.controller('supplierController', function ($scope, spendAnalyticsService, NgTableParams, $routeParams) {

  $scope.pageTitle = $routeParams.suppliername;

  $scope.bySupplier = function() {
    spendAnalyticsService.bySupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;

       $scope.transactions = data.length;
       $scope.spend = 0;
       for (var i=0; i<data.length; i++) {
         $scope.spend += data[i].invoice_amount;
       }

       $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.bySupplier();

  $scope.extractDate = function(date) {
    var dt = new Date(date);
    var parsed = dt.getDate() + "/" + (dt.getMonth()+1)  + "/" + dt.getFullYear();
    return parsed;
  };

  $scope.spendOvertimePerSupplier = function() {
    spendAnalyticsService.spendOvertimePerSupplier($routeParams.suppliername)
    .then(function(response) {

      var data = response.data.data;

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
        transactions.x.push(data[i].post_year);
        spend.x.push(data[i].post_year);
        transactions.y.push(data[i].transactions);
        spend.y.push(data[i].spend);
      }

      var vis = [transactions, spend];

      var layout = {
        title: 'Spend and Transactions',
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

      Plotly.newPlot('spendOvertimePerSupplier', vis, layout);

    });
  };

  $scope.spendOvertimePerSupplier();

  $scope.duplicateSpendSupplier = function() {
    spendAnalyticsService.duplicateSpendSupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       // $scope.transactions = data.length;
       // $scope.spend = 0;
       // for (var i=0; i<data.length; i++) {
       //   $scope.spend += data[i].invoice_amount;
       // }
       //
       // $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       // $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.duplicateSpendSupplier();

  $scope.crossCategorySupplier = function() {
    spendAnalyticsService.crossCategorySupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       // $scope.transactions = data.length;
       // $scope.spend = 0;
       // for (var i=0; i<data.length; i++) {
       //   $scope.spend += data[i].invoice_amount;
       // }
       //
       // $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       // $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.crossCategorySupplier();

  $scope.highGrowthSupplier = function() {
    spendAnalyticsService.highGrowthSupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       // $scope.transactions = data.length;
       // $scope.spend = 0;
       // for (var i=0; i<data.length; i++) {
       //   $scope.spend += data[i].invoice_amount;
       // }
       //
       // $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       // $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.highGrowthSupplier();

  $scope.outlierTransactionsSupplier = function() {
    spendAnalyticsService.outlierTransactionsSupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       // $scope.transactions = data.length;
       // $scope.spend = 0;
       // for (var i=0; i<data.length; i++) {
       //   $scope.spend += data[i].invoice_amount;
       // }
       //
       // $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       // $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.outlierTransactionsSupplier();

  $scope.outlierSupplier = function() {
    spendAnalyticsService.outlierSupplier($routeParams.suppliername)
    .then(function(response) {
       var data = response.data.data;
       console.log(data);

       // $scope.transactions = data.length;
       // $scope.spend = 0;
       // for (var i=0; i<data.length; i++) {
       //   $scope.spend += data[i].invoice_amount;
       // }
       //
       // $scope.transactionsTable = new NgTableParams({}, { dataset: data });
       // $scope.spend = Math.round($scope.spend);

    })
  };

  $scope.outlierSupplier();



});
