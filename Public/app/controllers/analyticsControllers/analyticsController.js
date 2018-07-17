userApp.controller('supplierAnalyticsController', function ($scope, spendAnalyticsService, NgTableParams) {

  //SUPPLIER
  $scope.spend = function() {
    spendAnalyticsService.totalSpend()
    .then(function(response) {
       $scope.totalSpend = response.data.data[0].amount;
       // console.log(response.data.data[]);
    })
  };

  $scope.spend();

  $scope.transactions = function() {
    spendAnalyticsService.transactions()
    .then(function(response) {
       $scope.totalTransactions = response.data.data[0].transactions;
    })
  };

  $scope.transactions();

  $scope.suppliers = function() {
    spendAnalyticsService.suppliers()
    .then(function(response) {
      $scope.totalSuppliers = response.data.data[0].vendors;
    })
  };

  $scope.suppliers();

  $scope.allSuppliers = function() {
    spendAnalyticsService.allSuppliers()
    .then(function(response) {
      var data = response.data.data;
      console.log(data);
      $scope.suppliersTable = new NgTableParams({}, { dataset: data });
    })
  };

  $scope.allSuppliers();

  $scope.spendTransactionScatter = function() {
    spendAnalyticsService.spendTransactionScatter()
    .then(function(response) {

      var data = response.data.data;

      var good = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Good',
        text: [],
        marker: { size: 12 }
      }

      var outlier = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Outlier',
        text: [],
        marker: { size: 12, color: 'rgb(255, 99, 132)'}
      }

      for (var i=0; i<data.length; i++) {
        if (data[i].amount != null) {
          if (data[i].outlier == 'true') {
            outlier.text.push(data[i].vendor_name);
            outlier.x.push(data[i].transactions);
            outlier.y.push(data[i].amount);
          } else {
            good.text.push(data[i].vendor_name);
            good.x.push(data[i].transactions);
            good.y.push(data[i].amount);
          }
        }
      }

      var vis = [good, outlier];

      var layout = {
        xaxis: {
          title: 'Transactions'
        },
        yaxis: {
          title: 'Spend'
        },
        title:'Spend-Transaction Per Supplier'
      };

      Plotly.newPlot('spendTransactionScatter', vis, layout);

    });
  };

  $scope.spendTransactionScatter();

  $scope.spendSupplierDistributions = function() {
    spendAnalyticsService.spendSupplierDistributions()
    .then(function(response) {

      var data = response.data.data[2];

      var spendVendor = [];
      var pspend = [];
      // console.log(data[0].rt);
      for (var i=0; i<data.length; i++) {
        if (data[i].rt <= 80 && data[i].rt !== null) {
          spendVendor.push(data[i].vendor_name);
          pspend.push(data[i].pspend);
        }
      }

      pspend.push(100-pspend.reduce((a,b) => a+b));
      spendVendor.push('other');

      var vis = [{
        values: pspend,
        labels: spendVendor,
        type: 'pie'
      }];

      var layout = {
        height: 600,
        width: 800,
        title: "Vendors with 80% of Spend"
      };

      Plotly.newPlot('top80Spend', vis, layout);

      var topTen = 0;
      var topTenPercent = 0;
      var topTwenty = 0;
      var topTwentyPercent = 0;
      var rest = 0;
      var restPercent = 0;
      var restVendorCount = 0;

      for (var i=0; i<data.length; i++) {
        if (data[i].num <= 10) {
          topTen += data[i].spend;
          topTenPercent = data[i].rt;
        } else if (data[i].num > 10 && data[i].num <= 20) {
          topTwenty += data[i].spend;
          topTwentyPercent = data[i].rt - topTenPercent;
        } else {
          if (data[i].spend !== null) {
            rest += data[i].spend;
            restPercent = data[i].rt - topTwentyPercent - topTenPercent;
            restVendorCount = data[i].num - 20;
          }
        }
      }

      var trace1 = {
        x: ['Proportions'],
        y: [topTenPercent],
        name: 'Top 10',
        type: 'bar',
        color: 'rgb(49,130,189)'
      };

      var trace2 = {
        x: ['Proportions'],
        y: [topTwentyPercent],
        name: 'Next 10',
        type: 'bar',
        color: 'rgb(255, 99, 132)'
      };

      var trace3 = {
        x: ['Proportions'],
        y: [restPercent],
        name: 'Last '+restVendorCount,
        type: 'bar',
        color: 'rgb(255, 99, 0)'
      };

      var vis = [trace1, trace2, trace3];

      var layout = {
        barmode: 'stack',
        title: 'Distribution of Spend across Vendors'
      };

      Plotly.newPlot('spendDistribution', vis, layout);

    });
  };

  $scope.spendSupplierDistributions();

  $scope.spendSuppliersAndTransactionsOvertime = function() {
    spendAnalyticsService.spendSuppliersAndTransactionsOvertime()
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

      Plotly.newPlot('spendSuppliersAndTransactionsOvertime', vis, layout);

    });
  };

  $scope.spendSuppliersAndTransactionsOvertime();
});

userApp.controller('insightsAnalyticsController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.spend = function() {
    spendAnalyticsService.totalSpend()
    .then(function(response) {
       $scope.totalSpend = response.data.data[0].amount;
    })
  };

  $scope.spend();

  $scope.transactions = function() {
    spendAnalyticsService.transactions()
    .then(function(response) {
       $scope.totalTransactions = response.data.data[0].transactions;
    })
  };

  $scope.transactions();

  $scope.suppliers = function() {
    spendAnalyticsService.suppliers()
    .then(function(response) {
      $scope.totalSuppliers = response.data.data[0].vendors;
    })
  };

  $scope.suppliers();

  $scope.duplicateSpend = function() {
    spendAnalyticsService.duplicateSpend()
    .then(function(response) {
       var data = response.data.data;

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         if (data[i].spend !== null) {
           totalSpend += data[i].spend;
         }
       }

       $scope.duplicateSpendAmount = totalSpend;
       $scope.duplicatesDiscovered = numDiscovered;
    })
  };

  $scope.duplicateSpend();

  $scope.highSpendLastMonth = function() {
    spendAnalyticsService.highSpendLastMonth()
    .then(function(response) {
       var data = response.data.data[2];

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         totalSpend += data[i].amount2;
       }
       // console.log(totalSpend);
       $scope.highGrowthAmount = Math.round(totalSpend);
       $scope.highGrowthDiscovered = numDiscovered;
    })
  };

  $scope.highSpendLastMonth();

  $scope.outlierTransactions = function() {
    spendAnalyticsService.outlierTransactions()
    .then(function(response) {
       var data = response.data.data;

       var totalSpend = 0;
       var numDiscovered = data.length;

       for (var i=0; i<data.length; i++) {
         totalSpend += data[i].invoice_amount;
       }

       $scope.outlierTransactionsAmount = Math.round(totalSpend);
       $scope.outlierTransactionsDiscovered = numDiscovered;
    })
  };

  $scope.outlierTransactions();

  $scope.outlierSuppliersPerCategory = function() {
    spendAnalyticsService.outlierSuppliersPerCategory()
    .then(function(response) {
       var data = response.data.data;

       var totalSpend = 0;
       var numDiscovered = 0;

       for (var i=0; i<data.length; i++) {
         if (data[i].cola == 'true' && data[i].colt == 'true') {
           totalSpend += data[i].a;
           numDiscovered += 1;
         }
       }

       $scope.outlierSuppliersAmount = Math.round(totalSpend);
       $scope.outlierSuppliersDiscovered = numDiscovered;
    })
  };

  $scope.outlierSuppliersPerCategory();

  $scope.oneTimeSuppliersPerCategory = function() {
    spendAnalyticsService.oneTimeSuppliersPerCategory()
    .then(function(response) {
       var data = response.data.data;

       var totalSpend = 0;
       var numDiscovered = 0;

       for (var i=0; i<data.length; i++) {
         if (data[i].cola == 'true' && data[i].colt == 'true') {
           totalSpend += data[i].a;
           numDiscovered += 1;
         }
       }

       $scope.oneTimeSuppliersAmount = Math.round(totalSpend);
       $scope.oneTimeSuppliersDiscovered = numDiscovered;

    })
  };

  $scope.oneTimeSuppliersPerCategory();

});

// CATEGORY CONTROLLER
userApp.controller('categoryAnalyticsController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.spend = function() {
    spendAnalyticsService.totalSpend()
    .then(function(response) {
       $scope.totalSpend = response.data.data[0].amount;
    })
  };

  $scope.spend();

  $scope.transactions = function() {
    spendAnalyticsService.transactions()
    .then(function(response) {
       $scope.totalTransactions = response.data.data[0].transactions;
    })
  };

  $scope.transactions();

  $scope.suppliers = function() {
    spendAnalyticsService.suppliers()
    .then(function(response) {
      $scope.totalSuppliers = response.data.data[0].vendors;
    })
  };

  $scope.suppliers();

  $scope.categories = function() {
    spendAnalyticsService.categories()
    .then(function(response) {
      $scope.totalCategories = response.data.data[0].categories;
    })
  };

  $scope.categories();

  $scope.spendSuppliersAndTransactionsPerCategory = function() {
    spendAnalyticsService.spendSuppliersAndTransactionsPerCategory()
    .then(function(response) {

      var data = response.data.data;

      $scope.categoryTable = new NgTableParams({}, { dataset: data });

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
        if (i < 10) {
          suppliers.x.push(data[i].category);
          transactions.x.push(data[i].category);
          spend.x.push(data[i].category);
          suppliers.y.push(data[i].vendors);
          transactions.y.push(data[i].transactions);
          spend.y.push(data[i].spend);
        }
      }

      var vis = [suppliers, transactions, spend];

      var layout = {
        title: 'Spend, Suppliers and Transactions',
        xaxis: {
          title: 'Category',
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

      Plotly.newPlot('spendSuppliersAndTransactionsPerCategory', vis, layout);

    });
  };

  $scope.spendSuppliersAndTransactionsPerCategory();

  $scope.highGrowthCategories = function() {
    spendAnalyticsService.highGrowthCategories()
    .then(function(response) {

      var data = response.data.data[2];

      var growth = {
        x: [],
        y: [],
        text: [],
        type: 'bar',
        name: '% Growth',
        marker: {
          color: 'rgb(49,130,189)',
          opacity: 0.7,
        }
      };

      for (var i=0; i<data.length; i++) {
        if (i < 10) {
          growth.x.push(data[i].category);
          growth.y.push(data[i].growth);
          growth.text.push('('+data[i].firstyear+','+data[i].secondyear+')');
        }
      }

      var vis = [growth];

      var layout = {
        title: 'High Growth Categories',
        xaxis: {
          title: 'Year',
          tickangle: -45
        },
        yaxis: {
          title: '% Growth',
        }
      };

      Plotly.newPlot('highGrowthCategories', vis, layout);

    });
  };

  $scope.highGrowthCategories();

  $scope.spendCategoryDistributions = function() {
    spendAnalyticsService.spendCategoryDistributions()
    .then(function(response) {

      var data = response.data.data[2];

      var spendCategory = [];
      var pspend = [];
      for (var i=0; i<data.length; i++) {
        if (data[i].distone == 1) {
          spendCategory.push(data[i].category);
          pspend.push(data[i].pspend);
        }
      }

      pspend.push(100-pspend.reduce((a,b) => a+b));
      spendCategory.push('other');

      var vis = [{
        values: pspend,
        labels: spendCategory,
        type: 'pie'
      }];

      var layout = {
        height: 600,
        width: 800,
        title: "Categories with 80% of Spend"
      };

      Plotly.newPlot('top80Spend', vis, layout);

      var topTen = 0;
      var topTenPercent = 0;
      var topTwenty = 0;
      var topTwentyPercent = 0;
      var rest = 0;
      var restPercent = 0;
      var restCategoryCount = 0;

      for (var i=0; i<data.length; i++) {
        if (data[i].disttwo == 1) {
          topTen += data[i].spend;
          topTenPercent = data[i].rt;
        } else if (data[i].disttwo == 2) {
          topTwenty += data[i].spend;
          topTwentyPercent = data[i].rt - topTenPercent;
        } else {
          if (data[i].spend !== null) {
            rest += data[i].spend;
            restPercent = data[i].rt - topTwentyPercent - topTenPercent;
            restCategoryCount = data[i].num - 20;
          }
        }
      }

      var trace1 = {
        x: ['Proportions'],
        y: [topTenPercent],
        name: 'Top 10',
        type: 'bar',
        color: 'rgb(49,130,189)'
      };

      var trace2 = {
        x: ['Proportions'],
        y: [topTwentyPercent],
        name: 'Next 10',
        type: 'bar',
        color: 'rgb(255, 99, 132)'
      };

      var trace3 = {
        x: ['Proportions'],
        y: [restPercent],
        name: 'Last '+restCategoryCount,
        type: 'bar',
        color: 'rgb(255, 99, 0)'
      };

      var vis = [trace1, trace2, trace3];

      var layout = {
        barmode: 'stack',
        title: 'Distribution of Spend across Categories'
      };

      Plotly.newPlot('spendDistribution', vis, layout);
    });
  };

  $scope.spendCategoryDistributions();

});
