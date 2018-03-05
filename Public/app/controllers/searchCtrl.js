var searchControllers = angular.module('searchControllers', []);

searchControllers

/*
  factory used to share case data between search page and the
  displace case page
  docID, relevance/label, query_raw_text, date_time, user_id, location
*/
.factory('myService', function(){
  var case_name = null;
  var case_text = null;

  // USER FEEDBACK TABLE: docID, relevance/label, query_raw_text, date_time, user_id, location
  var user_query = null;
  var case_id = null;
  // var feedback_date_time = null;
  // var feedback_location = null;

  // SEARCH RESULTS PERSISTANCY
  var search_results = null;

  return {
    getCase:function(){
      return [case_name, case_text];
    },
    setCase:function(name, text){
      case_name = name;
      case_text = text;
    },

    // EXTRA NEED FOR USER FEEDBACK
    setUserQuery:function(query){
      user_query = query;
    },
    getUserQuery:function(){
      return user_query;
    },
    setCaseID:function(id){
      case_id = id;
    },
    getCaseID:function(){
      return case_id;
    },

    // SEARCH RESULTS PERSISTANCY
    setSearchResults:function(results_data) {
      search_results = results_data;
    },
    getSearchResults:function(){
      return search_results;
    }

  }
})

/*
  search control:
    1) Sends the user query to the python model ($http.post)
    2) Recieves query results (JSON object of related cases to the query[data])
    3) Sets case data ($scope.results) to be dynamically displayed
*/
.controller('searchCtrl', function($http, $scope, myService){

  var searchTable = this;
  var results_per_page = 5;

  // AESTHETICS
  searchTable.main_search_bar = true;
  searchTable.search_examples = true;
  searchTable.feedback_submitted = true;

  this.searchData = function(data) {
    $http.post('/api/search', this.data).then(function(query_results){
      // access db for query results
      $scope.results = query_results.data;
      myService.setUserQuery($scope.search.data.query);
      //myService.setCaseRawText(query_results.data);

      // multi page results
      results_len = query_results.data.length
      if(results_len > results_per_page) {
        var num_pages = Math.ceil(results_len / results_per_page);
        $scope.pageResults = query_results.data.slice(0, results_per_page);
      }
      //console.log($scope.pageResults);


      // SEARCH RESULTS PERSISTANCY
      myService.setSearchResults($scope.results);

      // AESTHETICS
      searchTable.main_search_bar = false;
    });
  };

  this.nextPage = function(pg_num) {
    var results = myService.getSearchResults();
    $scope.pageResults = results.slice((results_per_page*(pg_num-1)), results_per_page*pg_num);
  }

//  Display case function is used to display the raw text of a choosen case
  this.displayCase = function(){
    var [name, text] = myService.getCase();
    var query = myService.getUserQuery();
    var id = myService.getCaseID();

    searchTable.casename = name;
    searchTable.doctext = text;
    searchTable.userquery = query;
    searchTable.caseid = id;

    // PARSING DOC TEXT
    /*var sub_text = text.split('\n');
    searchTable.sub_text = sub_text;

    var parsed = ' ';
    for(var i=0; i<sub_text.length; i++){
        var a = '<p>'.concat(sub_text[i].concat('</p>'));
        parsed = parsed.concat(a);
    }
    console.log(parsed);
    searchTable.parsed = parsed;*/
    // PARSING DOC TEXT
  };

  this.userFeedback = function(relevance) {
    searchTable.rel_score = relevance;
    searchTable.feedback_submitted = false;
  };

  // Send Case Data functions is used to send case data to the display case page
  $scope.sendCaseData = function(case_name, case_text, case_id){
    myService.setCase(case_name, case_text);
    myService.setCaseID(case_id);
  };

  // Send Case Data functions is used to send case data to the display case page
  this.getDateTimeLocation = function(){
    // PSQL Data type: timestamp without time zone '2004-10-19 10:23:54' https://www.postgresql.org/docs/9.1/static/datatype-datetime.html
    var full_date = new Date();
    var year = full_date.getFullYear();
    var month = full_date.getMonth();
    var day = full_date.getDate();
    var hour = full_date.getHours();
    var min = full_date.getMinutes();
    var sec = full_date.getSeconds();
    var timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    searchTable.timestamp = timestamp;
    // PSQL location: https://stackoverflow.com/questions/8150721/which-data-type-for-latitude-and-longitude
    // I will use two columns: LATITUDE and LONGITUDE
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        $scope.$apply(function(){
          $scope.position = position;
          searchTable.latitude = position.coords.latitude;
          searchTable.longitude = position.coords.longitude;
        });
      });
    }
  };

  // BACK TO RESULTS page
  this.backToResults = function() {
    $scope.results = myService.getSearchResults();
    $scope.query = myService.getUserQuery();
  };
});
