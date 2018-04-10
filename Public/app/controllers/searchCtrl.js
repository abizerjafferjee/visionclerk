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
  var case_id = null;
  // var feedback_date_time = null;
  // var feedback_location = null;

  // SEARCH RESULTS PERSISTANCY
  var search_results = null;

  // NEXT PAGE
  var num_pages_req = null;
  var case_viewed = null;
  var global_times_pressed = 0;

  return {
    getCaseText:function(){
      return case_text;
    },
    setCaseText:function(text){
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
    setCaseId:function(cid){
      case_id = cid;
    },
    getCaseId:function(){
      return case_id;
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
    },

    // WATSON HELPER FUNCTIONS
    getCaseNameFromWatsonResults:function(i_watson_result) {
      file_name = i_watson_result["extracted_metadata"]["filename"];
      if(file_name.includes('_')) {
        return file_name.substring(0, file_name.indexOf('_')).replace(/.html/ig, '').replace(/.pdf/ig, '');
      } else {
        return file_name.replace(/.html/ig, '').replace(/.pdf/ig, '');
      }

    },
    getCaseCourtFromWatsonResults:function(i_watson_result) {
      for (i = 0; i < i_watson_result['enriched_text'].entities.length; i++) {
        if ((i_watson_result['enriched_text'].entities[i]['type'] == 'Organization') && (i_watson_result['enriched_text'].entities[i]['text'].includes('Court'))) {
          return i_watson_result['enriched_text'].entities[i]['text'];
          break;
        }
      }
      return 'No Court information found';
    },
    getCaseDateFiledFromWatsonResults:function(i_watson_result) {
      if ("publicationdate" in i_watson_result["extracted_metadata"]) {
        return i_watson_result["extracted_metadata"]["publicationdate"];
      } else {
        return "No Information";
      }
    },
    //Abizer's Changes
    getCaseHighlightsFromWatsonResults:function(i_watson_result) {
      if ("highlight" in i_watson_result) {
        if ("html" in i_watson_result["highlight"]) {
          results = i_watson_result["highlight"]["html"];
          return results;
        } else {
          return "No highlights";
        }
      } else {
        return "No highlights";
      }
    },
    getTextHighlightsFromWatsonResults:function(i_watson_result) {
      if ("highlight" in i_watson_result) {
        if ("text" in i_watson_result["highlight"]) {
          results = i_watson_result["highlight"]["text"];
          return results;
        } else {
          return "No highlights";
        }
      } else {
        return "No highlights";
      }
    },
    addHighlightstoHtml: function(i_watson_highlights, i_watson_html) {
      if (i_watson_highlights === "No highlights") {
        return i_watson_html;
      }
      for (var i=0; i < i_watson_highlights.length; i++) {
        var div = document.createElement("div");
        div.innerHTML = i_watson_highlights[i];
        highlight = div.innerText;
        if (i_watson_html.indexOf(highlight) != -1) {
          i_watson_html = i_watson_html.replace(highlight, "<mark>"+highlight+"</mark>");
        }
      }
      return i_watson_html;
    },
    getCleanedHtml:function(i_watson_html) {
      html = i_watson_html.replace(/[^\x00-\x7F]/g, "");
      // html = html.replace("\n\n", "");
      // html = html.replace("\n", "<br>");
      return html;
    },
    getCleanedHighlights: function(i_watson_highlights) {
      for (var i=0; i < i_watson_highlights.length; i++) {
        i_watson_highlights[i] = i_watson_highlights[i].replace(/[^\x00-\x7F]/g, "");
      }
      return i_watson_highlights;
    }
  }
})

/*
  search control:
    1) Sends the user query to the python model ($http.post)
    2) Recieves query results (JSON object of related cases to the query[data])
    3) Sets case data ($scope.results) to be dynamically displayed
*/
.controller('searchCtrl', function($http, $scope, $routeParams, myService){

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
    app.loading = true;
    app.noResults = false;
    $http.post('/api/search', this.data).then(function(watson_response){
      app.loading = false;
      if(watson_response.data.matching_results == 0) {
        app.loading = false;
        app.noResults = true;
        app.main_search_bar = false;
        $scope.numButtons = [0];
      }
      var watson_results = watson_response.data.results;
      //console.log(watson_results);
      // Need to filter out extra information i.e create simpler results just with data needed
      // Data needed: case_name, case_id, case_court, case_datefiled, case_text, case_html
      var query_results = [];
      for (var i=0; i<watson_results.length; i++){
        var i_name = myService.getCaseNameFromWatsonResults(watson_results[i]);
        var i_id = watson_results[i].id;
        var i_court = myService.getCaseCourtFromWatsonResults(watson_results[i]);
        var i_datefiled = myService.getCaseDateFiledFromWatsonResults(watson_results[i]);
        //Abizer Highlight
        var i_highlights = myService.getCaseHighlightsFromWatsonResults(watson_results[i]);
        var i_text_highlights = myService.getTextHighlightsFromWatsonResults(watson_results[i]);
        filtered_result = '{"case_name":"' + i_name + '", "case_id":"' + i_id + '", "case_court":"' + i_court + '", "case_datefiled":"' + i_datefiled + '", "case_rank":"' + (i + 1) + '" }';
        query_results[i] = JSON.parse(filtered_result);
        query_results[i]['case_text'] = watson_results[i].text;
        query_results[i]['case_html'] = myService.getCleanedHtml(myService.addHighlightstoHtml(i_text_highlights, watson_results[i].html));
        query_results[i]['case_highlight'] = myService.getCleanedHighlights(i_highlights);
      }
      $scope.results = query_results;
      myService.setUserQuery($scope.search.data.query);

      // multi page results
      var results_len = query_results.length;
      if(results_len > results_per_page) {
        var num_pages = Math.ceil(results_len / results_per_page);
        myService.setNumPagesReq(num_pages);
        $scope.pageResults = query_results.slice(0, results_per_page);

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
      // single page results i.e less than 10 results
    } else {
      $scope.pageResults = query_results;
    }
      // SEARCH RESULTS PERSISTANCY
      myService.setSearchResults($scope.results);

      // AESTHETICS
      app.main_search_bar = false;
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
    var case_data = sessionStorage.displayCase;
    var case_json = JSON.parse(case_data);
    case_json['case_text'] = myService.getCaseText();

    app.casename = case_json.case_name;
    app.doctext = case_json.case_text;
    app.userquery = case_json.case_query;
    app.docid = case_json.case_id;
    app.caserank = case_json.case_rank;

    // rank is used to go back to reults
    myService.setCaseRank(case_json.case_rank);
    // case id is needed for user feedback_results
    myService.setCaseId(case_json.case_id);
  };

  // Send Case Data functions is used to send case data to the display case page
  $scope.sendCaseData = function(case_name, case_text, case_id, case_rank){
    var case_data = '{ "case_name":"' + case_name + '", "case_id":"' + case_id + '", "case_rank":"' + case_rank + '", "case_query":"' + myService.getUserQuery() + '" }';
    sessionStorage.displayCase = case_data;
    myService.setCaseText(case_text);

    // must be doc_id not case_id
    //console.log('/api/displaycase/' + case_id);
    //$http.post('/api/displaycase/' + case_id, case_data);
  };

  // BACK TO RESULTS page
  this.backToResults = function() {
    //var id = myService.getDocID();
    var rank = myService.getCaseRank();
    var data = myService.getSearchResults();
    var pgs_req = myService.getNumPagesReq();
    var cur_page = Math.floor(rank / results_per_page);
    app.curpage = cur_page;

    // case1: current case is in the first page
    if(cur_page == 0) {
      // case1_a: pages required <= 10
      if(pgs_req <= 10){
        var cur_results_beging = 0;
        var cur_results_end = cur_results_beging + results_per_page;
        $scope.cur_results = data.slice(cur_results_beging, cur_results_end);
        var num_buttons = _.range(1, (pgs_req + 1));
        $scope.numButtons = num_buttons;

        app.btr_nt = false;
        app.btr_pt = false;
      } else {
        // case1_b: pages required > 10
        var cur_results_beging = 0;
        var cur_results_end = cur_results_beging + results_per_page;
        $scope.cur_results = data.slice(cur_results_beging, cur_results_end);
        var num_buttons = _.range(1, 11); // max 10 buttons
        $scope.numButtons = num_buttons;

        app.btr_nt = true;
        app.btr_pt = false;
      }

    // current case is NOT in the first page
    } else {
      var cur_results_beging = cur_page * results_per_page;
      var cur_results_end = cur_results_beging + results_per_page;
      $scope.cur_results = data.slice(cur_results_beging, cur_results_end);

      // case2: current page within the first 10 buttons
      if(cur_page <= 10) { // max 10 buttons
        // case2_a: pages required <= 10
        if(pgs_req <= 10) { // max 10 buttons
          var num_buttons = _.range(1, (pgs_req + 1));
          $scope.numButtons = num_buttons;

          app.btr_nt = false;
          app.btr_pt = false;

        // case2_b: pages required > 10
        } else {
          var num_buttons = _.range(1, 11);  // max 10 buttons
          $scope.numButtons = num_buttons;

          app.btr_nt = true;
          app.btr_pt = false;
        }

      // current page is after the first 10 buttons
      } else {
        var buttons_begin = (Math.floor(cur_page / 10) * 10); // max 10 buttons
        // case3 : last pages/last button -not all 10 buttons are needed
        if((buttons_begin + 11) > pgs_req) { // max 10 buttons
          var buttons_end = pgs_req + 1;
          var num_buttons = _.range(buttons_begin, buttons_end);
          $scope.numButtons = num_buttons;

          app.btr_nt = false;
          app.btr_pt = true;

        // case4: current page is somewhere in the middle -not first 10 pages -not last pages
        } else {
          var buttons_end = buttons_begin + 11; // max 10 buttons
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
    /*app.rel_score = relevance;
    app.user_name = $scope.main.username;
    app.docID = myService.getDocID();
    app.caseId = myService.getCaseId();*/
    var case_id = myService.getCaseId();
    //var docID = myService.getDocID();
    var feedback = '{"username":"' + $scope.main.username + '", "query":"' + app.userquery + '", "docid":"' + case_id + '", "score":"' + relevance + '"}';
    app.userfeedback = JSON.parse(JSON.stringify(feedback));

    // data to send: ix | username | query | id | docid | score(0,1)
    $http.post('/api/userfeedback', app.userfeedback).then(function(feedback_results){
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

// Abizer New controller
// This control displays each case in a new panel
searchControllers.controller("panelCtrl", function($scope) {
  this.result;
  this.showPanel = false;
  this.selectResult = function(showPanel, result) {
    this.showPanel = showPanel;
    this.result = result;
  }
});
