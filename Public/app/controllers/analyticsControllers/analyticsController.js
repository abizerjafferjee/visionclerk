userApp.controller('spendAnalyticsController', function ($scope, spendAnalyticsService, NgTableParams) {

  $scope.duplicateSpend = function() {
    spendAnalyticsService.duplicateSpend()
    .then(function(response) {
      var data = response.data.data;
      console.log(response);
      var vendors = [];
      var count = [];

      for (var i=0; i<data.length; i++) {
        vendors.push(data[i].vendor_name);
        count.push(data[i]["count(*)"]);
      }

      console.log(vendors);
      console.log(count);

      var ctx = document.getElementById('myChart').getContext('2d');
      var chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: vendors,
              datasets: [{
                  label: "Duplicate Spend",
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                  data: count,
              }]
          }
      });
    });
  };

  $scope.duplicateSpend();

  $scope.allSpend = function() {
    spendAnalyticsService.allSpend()
    .then(function(response) {

      var data = response.data.data;
      var dates = [];
      var amount = [];

      for (var i=0; i<data.length; i++) {
        dates.push(data[i].year);
        amount.push(data[i]["sum(invoice_amount)"]);
      }

      var ctx = document.getElementById('allSpend').getContext('2d');
      var chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: dates,
              datasets: [{
                  label: "All Spend",
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                  data: amount,
              }]
          }
      });

    });
  };

  $scope.allSpend();

  $scope.suppliersPerCategory = function() {
    spendAnalyticsService.suppliersPerCategory()
    .then(function(response) {

      var data = response.data.data;
      var category = [];
      var vendors = [];

      for (var i=0; i<data.length; i++) {
        category.push(data[i].category);
        vendors.push(data[i]["vendors"]);
      }

      var ctx = document.getElementById('suppliersPerCategory').getContext('2d');
      var chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: category,
              datasets: [{
                  label: "Suppliers Per Category",
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                  data: vendors,
              }]
          }
      });

    });
  };

  $scope.suppliersPerCategory();

});
