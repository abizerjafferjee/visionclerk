var mysql = require('mysql');
fs = require('fs');
var csv = require('fast-csv');
var parser = require('node-csv-parse');
var Series = require('pandas-js').Series;
var DataFrame = require('pandas-js').DataFrame;

// connect mariadb
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Qsaxzop15!',
  database : 'visionclerk',
  port: 8000,
  multipleStatements: true
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to mariadb");
});

var sqlQueries = {
  writeInvoicetoSQL: function(invoice) {
    var query = "INSERT INTO accounts_payable_all (invoice_num, invoice_amount, due_date, post_date, category, vendor_id, vendor_name, payment_terms, currency) VALUES " +
    "(?, ?, ?, ?, ?, ?, ?, ?, ?);";
    connection.query(query, [invoice.invoice_id, invoice.amount_total, invoice.date_due, invoice.date_issue, null, invoice.customer_id, invoice.sender_name, invoice.terms, invoice.currency], function(error, results, fields) {
      if (error){
        console.log(results);
      }
    });
  },

  writeAPtoSQL: function(fileObject) {
    var stream = fs.createReadStream(fileObject.filePath);

    var csvStream = csv.fromStream(stream, {headers: true, ignoreEmpty: true})
    .on("data", function(data) {
      csvStream.pause();

      var col_names = Object.keys(data);
      var supplier_id = null;
      var supplier = null;
      var invoice_no = null;
      var post_date = null;
      var due_date = null;
      var category = null;
      var amount = null;
      var currency = null;
      var payment_terms = null;

      for (var i=0; i<col_names.length; i++) {

        if (col_names[i].trim() == "SUPPLIER_ID") {
          if (data["SUPPLIER_ID"] != undefined) {
            supplier_id = data["SUPPLIER_ID"].trim();
          }
        }

        else if (col_names[i].trim() == "SUPPLIER") {
          if (data["SUPPLIER"] !== undefined) {
            supplier = data["SUPPLIER"].trim().toLowerCase();
          }
        }

        else if (col_names[i].trim() == "INVOICE_NO") {
          if (data["INVOICE_NO"] !== undefined) {
            invoice_no = data["INVOICE_NO"].trim();
          }
        }

        else if (col_names[i].trim() == "POST_DATE") {
          if (data["POST_DATE"] !== undefined) {
            post_date = data["POST_DATE"].trim();
            if (post_date.includes("-")) {
              var date_parts = data["POST_DATE"].split("-");
              post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
            } else if (post_date.includes("/")) {
              var date_parts = data["POST_DATE"].split("/");
              post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
            }
          }
        }

        else if (col_names[i].trim() == "DUE_DATE") {
          if (data["DUE_DATE"] !== undefined) {
            due_date = data["DUE_DATE"].trim();
            if (due_date.includes("-")) {
              var date_parts = data["DUE_DATE"].split("-");
              due_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
            } else if (post_date.includes("/")) {
              var date_parts = data["DUE_DATE"].split("/");
              due_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
            }
          }
        }

        else if (col_names[i].trim() == "CATEGORY") {
          if (data["CATEGORY"] !== undefined) {
            category = data["CATEGORY"].trim().toLowerCase();
          }
        }

        else if (col_names[i].trim() == "AMOUNT") {
          if (data["AMOUNT"] !== undefined) {
            amount = data["AMOUNT"].trim();
            if (typeof(amount) == "string") {
              if (isNaN(amount)) {
                amount = Number(data["AMOUNT"].replace(/,/g, ""));
              }
            } else if (amount == null || amount == undefined) {
              amount = null;
            }
          }
        }

        else if (col_names[i].trim() == "CURRENCY") {
          if (data["CURRENCY"] !== undefined) {
            currency = data["CURRENCY"].trim().toLowerCase();
          }
        }

        else if (col_names[i].trim() == "PAYMENT_TERMS") {
          if (data["PAYMENT_TERMS"] !== undefined) {
            payment_terms = data["PAYMENT_TERMS"].trim().toLowerCase();
          }
        }

      }

      var query = "INSERT INTO accounts_payable_all (invoice_num, vendor_name, vendor_id, invoice_amount, currency, due_date, post_date, category, payment_terms, source_id) VALUES " +
      "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      connection.query(query, [invoice_no, supplier, supplier_id, amount, currency, due_date, post_date, category, payment_terms, String(fileObject._id)], function(error, results, fields) {
        if (error) {
          console.log(error);
          // throw error;
        }
      });
      csvStream.resume();
    })
    .on("end", function(data) {
      console.log("File Written to SQL");
    });

  },

  // Read rows
  infoPerSource: function(files, callback) {
    var query = "select source_id, currency, min(post_date) as min_date, max(post_date) as max_date, round(sum(invoice_amount),2) as total, count(*) as num_lines from accounts_payable_all group by source_id;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(files, results);
    });
  },

  deleteBySource: function(source_id, callback) {
    var query = "delete from accounts_payable_all where source_id = " + "'" + source_id + "';";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },


  // Insights
  duplicateSpend: function(callback) {
    var query = "select invoice_num, vendor_name, sum(invoice_amount) as spend, count(*) as duplicates from accounts_payable_all group by invoice_num, vendor_name having count(*) > 1";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  highSpendLastMonth: function(callback) {
    var query = "set @one_number:=0; set @two_number:=0; select vendor_name, round(a1,2) as amount1, round(a2, 2) as amount2, round(ch,2) as high_ch, d1, max(d2) as last_d from " +
    "(select tone.vendor_name, tone.d as d1, ttwo.d as d2, tone.a as a1, ttwo.a as a2, ((ttwo.a - tone.a)/tone.a)*100 as ch from " +
    "(select vendor_name, d, a, (@one_number:=@one_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as tone " +
    "join (select vendor_name, d, a, (@two_number:=@two_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as ttwo " +
    "on tone.vendor_name = ttwo.vendor_name and tone.num = ttwo.num - 1 and tone.d < ttwo.d) as ftable where ch >= 100 group by vendor_name order by ch desc, a2 desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  highSpendLastYear: function(callback) {
    var query = "set @one_number:=0; set @two_number:=0; select vendor_name, a1, a2, round(ch,2) as high_ch, d1, max(d2) as last_d from" +
    "(select tone.vendor_name, tone.d as d1, ttwo.d as d2, tone.a as a1, ttwo.a as a2, ((ttwo.a - tone.a)/tone.a)*100 as ch from" +
    "(select vendor_name, d, a, (@one_number:=@one_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as tone" +
    "join (select vendor_name, d, a, (@two_number:=@two_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as ttwo" +
    "on tone.vendor_name = ttwo.vendor_name and tone.num = ttwo.num - 1 and tone.d < ttwo.d) as ftable where ch >= 100 group by vendor_name order by ch desc, a2 desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  outlierTransactions: function(callback) {
    var query = "select * from (select ttwo.vendor_name, post_date, invoice_num, invoice_amount, round(average, 2) as average, round(stdev, 2) as stdev, " +
    "case when invoice_amount < (average - (2 * stdev)) then 'low amount' when invoice_amount > (average + (3 * stdev)) then 'high amount' else 'normal' end as outlier " +
    "from accounts_payable_all join (select vendor_name, avg(invoice_amount) as average, stddev(invoice_amount) as stdev from accounts_payable_all group by vendor_name) as ttwo " +
    "on accounts_payable_all.vendor_name = ttwo.vendor_name) as finaltable where outlier = 'high amount' or outlier = 'low amount' order by post_date desc, invoice_amount desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  // outlierSuppliersPerCategory: function(callback) {
  //   var query = "select vendor_name, category, amount, transactions, spendpertrans, average, stdev, " +
  //   "case when spendpertrans < (average - (2 * stdev)) then 'inefficient' when spendpertrans > (average + (2 * stdev)) then 'outlier' else 'good' end as outlier " +
  //   "from (select vendor_name, tabletwo.category, sum(invoice_amount) as amount, count(invoice_num) as transactions, sum(invoice_amount)/count(invoice_num) as spendpertrans, average, stdev from accounts_payable_all join " +
  //   "(select category, avg(p) as average, stddev(p) as stdev from (select vendor_name, category, sum(invoice_amount) as amount, count(invoice_num) as transactions, round(sum(invoice_amount)/count(invoice_num),2) as p from accounts_payable_all group by vendor_name) as tableone group by category) as tabletwo " +
  //   "on accounts_payable_all.category = tabletwo.category group by vendor_name) as tablethree;";
  //   connection.query(query, function(error, results, fields) {
  //     if (error) throw error;
  //     callback(results);
  //   });
  // },

  // where the spend for a vendor is 1 stdev below average in the category but the transactions are 1 stdev above average
  outlierSuppliersPerCategory: function (callback) {
    var query = "(select vendor_name, tabletwo.category, a, averagea, stdeva, t, averaget, stdevt, case when a<(averagea-(stdeva)) then 'true' else 'false' end as cola , case when t>(averaget+(stdevt)) then 'true' else 'false' end as colt from " +
                "(select vendor_name, category, round(sum(invoice_amount),2) as a, round(count(invoice_num),2) as t from accounts_payable_all group by vendor_name, category) as tablethree join " +
                "(select category, round(avg(t),2) as averaget, round(stddev(t),2) as stdevt, round(avg(a),2) as averagea, round(stddev(a),2) as stdeva from (select vendor_name, category, sum(invoice_amount) as a, count(invoice_num) as t from accounts_payable_all group by vendor_name, category) as tableone group by category) as tabletwo " +
                "on tabletwo.category = tablethree.category)";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  // where the supplier has spend which is 2 stdev higher than avg and transactions 2 stdev less than avg
  oneTimeSuppliersPerCategory: function (callback) {
    var query = "(select vendor_name, tabletwo.category, a, averagea, stdeva, t, averaget, stdevt, case when a>(averagea+(2*stdeva)) then 'true' else 'false' end as cola , case when t<(averaget-(2*stdevt)) then 'true' else 'false' end as colt from " +
                "(select vendor_name, category, round(sum(invoice_amount),2) as a, round(count(invoice_num),2) as t from accounts_payable_all group by vendor_name, category) as tablethree join " +
                "(select category, round(avg(t),2) as averaget, round(stddev(t),2) as stdevt, round(avg(a),2) as averagea, round(stddev(a),2) as stdeva from (select vendor_name, category, sum(invoice_amount) as a, count(invoice_num) as t from accounts_payable_all group by vendor_name, category) as tableone group by category) as tabletwo " +
                "on tabletwo.category = tablethree.category)";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  //inconsistent supplier

  //cross-category supplier (both here and in category)

  allSpend: function (callback) {
    var query = "select currency, sum(invoice_amount), extract(year from post_date) as year from accounts_payable_all group by extract(year from post_date), currency order by post_date;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },


  // CATEGORY

  spendSuppliersAndTransactionsPerCategory: function (callback) {
    var query = "select category, round(sum(invoice_amount), 2) as spend, count(invoice_num) as transactions, count(distinct vendor_name) as vendors from accounts_payable_all group by category order by spend desc, transactions desc, vendors desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  highGrowthCategories: function (callback) {
    var query = "set @one_number:=0; set @two_number:=0; select * from (select tableone.category, max(tableone.d) as firstyear, max(tabletwo.d) as secondyear, tableone.a as firstamount, tabletwo.a as secondamount, round(((tabletwo.a - tableone.a)/tableone.a) * 100,2) as growth from " +
                "(select category, d, a, (@one_number:=@one_number + 1) as num from (select category, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by category, extract(year from post_date) order by category, extract(year from post_date)) as A) as tableone " +
                "join (select category, d, a, (@two_number:=@two_number + 1) as num from (select category, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by category, extract(year from post_date) order by category, extract(year from post_date)) as B) as tabletwo " +
                "on tableone.category = tabletwo.category and tableone.num = tabletwo.num - 1 and tableone.d < tabletwo.d group by category) as tablethree where growth>100 order by growth desc, secondamount desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendCategoryDistributions: function (callback) {
    // var query = "set @runtot:=0; " + "select vendor_name, spend, pspend, (@runtot := @runtot + pspend) as rt from (select  vendor_name, round(sum(invoice_amount),2) as spend, round((sum(invoice_amount)/(select sum(invoice_amount) from accounts_payable_all))*100,2) as pspend from accounts_payable_all group by vendor_name order by spend desc) as A;";
    var query = "set @runtot:=0;set @row_number:=0;select category, spend, pspend, rt, num, case when rt<=80 then true when pspend >= 80 then true else false end as distone, case when num<=10 then 1 when num>10 and num<=20 then 2 else 3 end as disttwo from" +
    "(select category, spend, pspend, (@runtot := @runtot + pspend) as rt, (@row_number:=@row_number + 1) as num from (select category, round(sum(invoice_amount),2) as spend, round((sum(invoice_amount)/(select sum(invoice_amount) from accounts_payable_all))*100,2) as pspend from accounts_payable_all group by category order by spend desc) as A) as B;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendTrendPerCategory: function (callback) {
    var query = "select category, currency, sum(invoice_amount), extract(year from post_date) as year from accounts_payable_all group by category, extract(year from post_date), currency order by post_date;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  // EACH CATEGORY
  byCategory: function (category_name, callback) {
    var query = "select vendor_name, round(sum(invoice_amount),2) as spend, count(invoice_num) as transactions from accounts_payable_all where category='" + category_name + "' group by vendor_name order by spend desc, transactions desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendOvertimePerCategory: function (category_name, callback) {
    var query = "select extract(year from post_date) as post_year, round(sum(invoice_amount),2) as spend, count(distinct vendor_name) as vendors, count(invoice_num) as transactions from accounts_payable_all where category='" + category_name + "' group by extract(year from post_date), category order by post_year, spend desc, vendors desc, transactions desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  // Suppliers
  spend: function (callback) {
    var query = "select round(sum(invoice_amount), 0) as amount from accounts_payable_all;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  transactions: function (callback) {
    var query = "select count(invoice_num) as transactions from accounts_payable_all;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  suppliers: function (callback) {
    var query = "select count(distinct vendor_name) as vendors from accounts_payable_all;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  categories: function (callback) {
    var query = "select count(distinct category) as categories from accounts_payable_all;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  allSuppliers: function (callback) {
    var query = "select vendor_name, round(sum(invoice_amount), 2) as spend, count(invoice_num) as transactions, category from accounts_payable_all group by vendor_name, category order by spend desc, transactions desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendTransactionScatter: function (callback) {
    var query = "select F.vendor_name, round(F.amount,2) as amount, F.transactions, F.fav, F.sav, case when F.fav < (0.25*F.sav) then 'inefficient' when F.fav > (1.75*F.sav) then 'outlier' else 'good' end as outlier " +
    "from (select B.vendor_name, B.amount, B.transactions, round(B.amount/B.transactions, 2) as fav, round(C.av,2) as sav from " +
    "(select vendor_name, sum(invoice_amount) as amount, count(invoice_num) as transactions, round(sum(invoice_amount)/count(invoice_num),2) as p from accounts_payable_all group by vendor_name) as B cross join " +
    "(select avg(p) as av from (select vendor_name, sum(invoice_amount) as amount, count(invoice_num) as transactions, round(sum(invoice_amount)/count(invoice_num),2) as p from accounts_payable_all group by vendor_name) as A) as C) as F order by amount desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendTransactionsPerSupplier: function (callback) {
    var query = "select  vendor_name, round(sum(invoice_amount),2) as spend, round((sum(invoice_amount)/(select sum(invoice_amount) from accounts_payable_all))*100,2) as pspend, count(invoice_num) as transactions, round((count(invoice_num)/(select count(invoice_num) from accounts_payable_all))*100,2) as ptransactions from accounts_payable_all group by vendor_name order by sum(invoice_amount) desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendSuppliersAndTransactionsOvertime: function (callback) {
    var query = "select extract(year from post_date) as post_year, sum(invoice_amount) as spend, count(distinct vendor_name) as vendors, count(invoice_num) as transactions from accounts_payable_all group by extract(year from post_date) order by post_year;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendSupplierDistributions: function (callback) {
    // var query = "set @runtot:=0; " + "select vendor_name, spend, pspend, (@runtot := @runtot + pspend) as rt from (select  vendor_name, round(sum(invoice_amount),2) as spend, round((sum(invoice_amount)/(select sum(invoice_amount) from accounts_payable_all))*100,2) as pspend from accounts_payable_all group by vendor_name order by spend desc) as A;";
    var query = "set @runtot:=0;" +
                "set @row_number:=0;" +
                "select vendor_name, spend, pspend, rt, num, case when rt<=80 then true else false end as distone," +
                "case when num<=10 then 1 when num>10 and num<=20 then 2 else 3 end as disttwo from (select vendor_name, spend, pspend, (@runtot := @runtot + pspend) as rt, (@row_number:=@row_number + 1) as num from (select  vendor_name, round(sum(invoice_amount),2) as spend, round((sum(invoice_amount)/(select sum(invoice_amount) from accounts_payable_all))*100,2) as pspend from accounts_payable_all group by vendor_name order by spend desc) as A) as B;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  // EACH SUPPLIER
  bySupplier: function (supplier_name, callback) {
    console.log(supplier_name)
    var query = "select * from accounts_payable_all where vendor_name = '" + supplier_name + "' order by post_date desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendOvertimePerSupplier: function (supplier_name, callback) {
    var query = "select extract(year from post_date) as post_year, round(sum(invoice_amount),2) as spend, count(invoice_num) as transactions from accounts_payable_all where vendor_name='" + supplier_name + "' group by extract(year from post_date), vendor_name order by post_year, spend desc, transactions desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  duplicateSpendSupplier: function(supplier_name, callback) {
    var query = "select invoice_num, vendor_name, invoice_amount, count(*) as duplicates from accounts_payable_all where vendor_name='" + supplier_name + "' group by invoice_num, vendor_name having count(*) > 1";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  crossCategorySupplier: function(supplier_name, callback) {
    var query = "select vendor_name, category, sum(invoice_amount) from accounts_payable_all where vendor_name='" + supplier_name + "' group by category;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  highGrowthSupplier: function(supplier_name, callback) {
    var query = "set @one_number:=0; set @two_number:=0; select vendor_name, a1, a2, round(ch,2) as high_ch, d1, max(d2) as last_d from " +
    "(select tone.vendor_name, tone.d as d1, ttwo.d as d2, tone.a as a1, ttwo.a as a2, ((ttwo.a - tone.a)/tone.a)*100 as ch from " +
    "(select vendor_name, d, a, (@one_number:=@one_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as tone " +
    "join (select vendor_name, d, a, (@two_number:=@two_number + 1) as num from (select vendor_name, extract(year from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year from post_date) order by vendor_name, extract(year_month from post_date)) as A) as ttwo " +
    "on tone.vendor_name = ttwo.vendor_name and tone.num = ttwo.num - 1 and tone.d < ttwo.d) as ftable where ch >= 100 and vendor_name = '" + supplier_name + "' group by vendor_name order by ch desc, a2 desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  outlierTransactionsSupplier: function(supplier_name, callback) {
    var query = "select * from (select ttwo.vendor_name, post_date, invoice_num, invoice_amount, round(average, 2) as average, round(stdev, 2) as stdev, " +
    "case when invoice_amount < (average - (2 * stdev)) then 'low amount' when invoice_amount > (average + (3 * stdev)) then 'high amount' else 'normal' end as outlier " +
    "from accounts_payable_all join (select vendor_name, avg(invoice_amount) as average, stddev(invoice_amount) as stdev from accounts_payable_all group by vendor_name) as ttwo " +
    "on accounts_payable_all.vendor_name = ttwo.vendor_name) as finaltable where vendor_name='" + supplier_name + "' and (outlier = 'high amount' or outlier = 'low amount') order by post_date desc, invoice_amount desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  outlierSupplier: function (supplier_name, callback) {
    var query = "select vendor_name, tabletwo.category, a, averagea, stdeva, t, averaget, stdevt, case when a<(averagea-(stdeva)) then 'true' else 'false' end as cola , case when t>(averaget+(stdevt)) then 'true' else 'false' end as colt from " +
                "(select vendor_name, category, round(sum(invoice_amount),2) as a, round(count(invoice_num),2) as t from accounts_payable_all group by vendor_name, category) as tablethree join " +
                "(select category, round(avg(t),2) as averaget, round(stddev(t),2) as stdevt, round(avg(a),2) as averagea, round(stddev(a),2) as stdeva from (select vendor_name, category, sum(invoice_amount) as a, count(invoice_num) as t from accounts_payable_all group by vendor_name, category) as tableone group by category) as tabletwo " +
                "on tabletwo.category = tablethree.category where vendor_name='" + supplier_name + "';";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

};

module.exports = sqlQueries;
