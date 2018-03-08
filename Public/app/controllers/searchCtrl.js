var searchControllers = angular.module('searchControllers', ['ngSanitize']);

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
  var doc_id = null;
  var case_rank = null;
  // var feedback_date_time = null;
  // var feedback_location = null;

  // SEARCH RESULTS PERSISTANCY
  var search_results = null;

  // NEXT PAGE
  var num_pages_req = null;
  var case_viewed = null;
  var global_times_pressed = 0;

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
    setDocID:function(id){
      doc_id = id;
    },
    getDocID:function(){
      return doc_id;
    },
    setCaseRank:function(rank) {
      case_rank = rank;
    },
    getCaseRank:function() {
      return case_rank;
    },

    // SEARCH RESULTS PERSISTANCY
    setSearchResults:function(results_data) {
      search_results = results_data;
    },
    getSearchResults:function(){
      return search_results;
    },

    // NEXT PAGE
    setNumPagesReq:function(pages_req) {
      num_pages_req = pages_req;
    },
    getNumPagesReq:function() {
      return num_pages_req;
    },
    setCaseViewed:function(caseViewed) {
      case_viewed = caseViewed;
    },
    getCaseViewed:function() {
      return case_viewed;
    },
    setTimesPressed:function(cur_times_pressed) {
      global_times_pressed = cur_times_pressed;
    },
    getTimesPressed:function() {
      return global_times_pressed;
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

  var app = this;
  var results_per_page = 10;

  // AESTHETICS
  app.main_search_bar = true;
  app.search_examples = true;
  app.feedback_submitted = true;
  app.nextTen = false;
  app.prevTen = false;
  app.noResults = false;
  // back to results next ten and prev ten
  app.btr_nt = false;
  app.btr_pt = false;

  this.searchData = function(data) {
    $http.post('/api/search', this.data).then(function(query_results){

      // if results sucess is undefined it means we have results
      if(angular.isUndefined(query_results.data.success)){
        app.noResults = true;
        
        // access db for query results
        for (var i=0; i<query_results.data.length; i++){
          query_results.data[i].rank = i+1;
        }
        $scope.results = query_results.data;
        myService.setUserQuery($scope.search.data.query);
        //myService.setCaseRawText(query_results.data);

        // multi page results
        results_len = query_results.data.length
        if(results_len > results_per_page) {
          var num_pages = Math.ceil(results_len / results_per_page);
          myService.setNumPagesReq(num_pages);
          $scope.pageResults = query_results.data.slice(0, results_per_page);

          // generating buttons
          if(num_pages <= results_per_page) {
            num_buttons = _.range(1, num_pages + 1);
            $scope.numButtons = num_buttons;

          // need to generate more than 10 buttons i.e 100 results
          } else {
            app.nextTen = true;
            num_buttons = _.range(1, (results_per_page + 1));
            $scope.numButtons = num_buttons;
          }
        }
        // SEARCH RESULTS PERSISTANCY
        myService.setSearchResults($scope.results);

        // AESTHETICS
        app.main_search_bar = false;

      // ressults success did NOT successed i.e no matching documents
      } else if(!query_results.data.success) {
        app.noResults = true;
        app.main_search_bar = false;
      }
    });
  };

  this.nextPage = function(pg_num) {
    var results = myService.getSearchResults();
    $scope.pageResults = results.slice((results_per_page * (pg_num - 1)), results_per_page*pg_num);
    $scope.cur_results = results.slice((results_per_page * (pg_num - 1)), results_per_page*pg_num);
  };

  this.nextTenPages = function() {
    times_pressed = myService.getTimesPressed();
    times_pressed += 1;
    myService.setTimesPressed(times_pressed);
    // check for number of pages required
    pgs_req = myService.getNumPagesReq();

    // if less than 10 pages are needed
    next_ten_start = (times_pressed * results_per_page);
    if(pgs_req <= next_ten_start + (results_per_page + 1)) {
      num_buttons = _.range(next_ten_start, pgs_req + 1);
      $scope.numButtons = num_buttons;

      app.nextTen = false;
      app.btr_nt = false;

    } else {
      num_buttons = _.range(next_ten_start, next_ten_start + 11);
      $scope.numButtons = num_buttons;
    }

    app.prevTen = true;
    app.btr_pt = true;
  };

  this.prevTenPages = function() {
    pgs_req = myService.getNumPagesReq();
    times_pressed = myService.getTimesPressed();
    cur_start = times_pressed * results_per_page;
    prev_start = cur_start - results_per_page;
    if(prev_start < 1) {
      num_buttons = _.range(1, 11);
      $scope.numButtons = num_buttons;

      app.prevTen = false;
      app.btr_pt = false;
    } else {
      num_buttons = _.range(prev_start, prev_start + 11);
      $scope.numButtons = num_buttons;
    }

    app.nextTen = true;
    app.btr_nt = true;
    times_pressed -= 1;
    myService.setTimesPressed(times_pressed);
  };


//  Display case function is used to display the raw text of a choosen case
  this.displayCase = function(){
    var [name, text] = myService.getCase();
    var query = myService.getUserQuery();
    var id = myService.getDocID();
    var rank = myService.getCaseRank();

    app.casename = name;
    app.doctext = text;
    app.userquery = query;
    app.docid = id;
    app.caserank = rank;

    // PARSING DOC TEXT
    /*var sub_text = text.split('\n');
    app.sub_text = sub_text;

    var parsed = ' ';
    for(var i=0; i<sub_text.length; i++){
        var a = '<p>'.concat(sub_text[i].concat('</p>'));
        parsed = parsed.concat(a);
    }
    console.log(parsed);
    app.parsed = parsed;*/
    // PARSING DOC TEXT
  };

  // Send Case Data functions is used to send case data to the display case page
  $scope.sendCaseData = function(case_name, case_text, doc_id, rank){
    myService.setCase(case_name, case_text);
    myService.setDocID(doc_id);
    myService.setCaseRank(rank);
  };

  // BACK TO RESULTS page
  this.backToResults = function() {
    var id = myService.getDocID();
    var rank = myService.getCaseRank();
    var data = myService.getSearchResults();
    var pgs_req = myService.getNumPagesReq();
    //var index = data.map(function(d) { return d['id']; }).indexOf(rank);
    var cur_page = Math.floor(rank / results_per_page);
    app.curpage = cur_page;

    // case1: current case is in the first page
    if(cur_page == 0) {
      var cur_results_beging = 0;
      var cur_results_end = cur_results_beging + results_per_page;
      $scope.cur_results = data.slice(cur_results_beging, cur_results_end);
      var num_buttons = _.range(1, results_per_page + 1);
      $scope.numButtons = num_buttons;

      app.btr_nt = true;
      app.btr_pt = false;

    // current case is NOT in the first page
    } else {
      var cur_results_beging = cur_page * results_per_page;
      var cur_results_end = cur_results_beging + results_per_page;
      $scope.cur_results = data.slice(cur_results_beging, cur_results_end);

      // case2: current page within the first 10 buttons
      if(cur_page <= 10) {
        var num_buttons = _.range(1, 11);
        $scope.numButtons = num_buttons;

        app.btr_nt = true;
        app.btr_pt = false;

      // current page is after the first 10 buttons
      } else {
        var buttons_begin = (Math.floor(cur_page / 10) * 10);
        // case3 : last pages/last button -not all 10 buttons are needed
        if((buttons_begin + 11) > pgs_req) {
          var buttons_end = pgs_req + 1;
          var num_buttons = _.range(buttons_begin, buttons_end);
          $scope.numButtons = num_buttons;

          app.btr_nt = false;
          app.btr_pt = true;

        // case4: current page is somewhere in the middle -not first 10 pages -not last pages
        } else {
          var buttons_end = buttons_begin + 11;
          var num_buttons = _.range(buttons_begin, buttons_end);
          $scope.numButtons = num_buttons;

          app.btr_nt = true;
          app.btr_pt = true;
        }
      }
    }

    app.backToResultsNextTen = true;
    app.backToResultsPrevTen = true;
    $scope.query = myService.getUserQuery();
  };

  this.userFeedback = function(relevance) {
    app.rel_score = relevance;
    app.user_name = $scope.main.username;

    // data to send: id | username | query | docid | score(0,1)
    $http.post('/api/userfeedback', app).then(function(feedback_results){
        // add if cases for failures, allow users to submit again
        if(feedback_results.statusText == 'OK') {
          app.feedback_submitted = false;
        } else {
          console.log("There was an error submitting user's feedback");
          //app.feedback_submitted = false;
        }
    });
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
    app.timestamp = timestamp;
    // PSQL location: https://stackoverflow.com/questions/8150721/which-data-type-for-latitude-and-longitude
    // I will use two columns: LATITUDE and LONGITUDE
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        $scope.$apply(function(){
          $scope.position = position;
          app.latitude = position.coords.latitude;
          app.longitude = position.coords.longitude;
        });
      });
    }
  };
});
