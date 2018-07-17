var mysql = require('mysql');
fs = require('fs');
var csv = require('fast-csv');
var parser = require('node-csv-parse');
var Series = require('pandas-js').Series;
var DataFrame = require('pandas-js').DataFrame;

// connect mariadb
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '05211998',
  database : 'VisionClerk',
  port: 3306,
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
      if (error) throw error;
      console.log(results);
    });
  },

  writeContractToSQL: function(contract) {
    var query = "INSERT INTO contracts (contractor, contracting_authority, reference_number, title, short_description, start_date, end_date, dispatch_date, contract_end_date, contact_person, contractor_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    connection.query(query, [contract.contractor, contract.contracting_authority, contract.reference_number, contract.title, contract.short_description, contract.start_date, contract.end_date, contract.dispatch_date, contract.contract_end_date, contract.contact_person, contract.contractor_address], function(error, results, fields){
      if (error) throw error;
    });
  },

  readCSV: function(path) {

    // fs.readFile(path, 'utf8', (err, data) => {
    //   if(err) { throw err; }
    //   // console.log(data);
    //   console.log(parser(data).asObjects());
    // });

    var stream = fs.createReadStream(path);

    dic = [];

    var csvStream = csv.fromStream(stream, {headers: true, ignoreEmpty: true})
    .on("data", function(data) {
      csvStream.pause();
      dic.push(data);

      var supplier = data["SUPPLIER"].toLowerCase();
      var currency = data["CURRENCY"].toLowerCase();
      var category = data["CATEGORY"].toLowerCase();
      var invoice_no = data["INVOICE_NO"];

      var amount = data["AMOUNT"];
      if (typeof(data["AMOUNT"]) == "string") {
        if (isNaN(amount)) {
          amount = Number(data["AMOUNT"].replace(/,/g, ""));
        }
      }

      var post_date = data["POST_DATE"];
      if (post_date.includes("-")) {
        var date_parts = data["POST_DATE"].split("-");
        // post_date = new Date(date_parts[2], date_parts[1], date_parts[0]);
        post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
      } else if (post_date.includes("/")) {
        var date_parts = data["POST_DATE"].split("/");
        // post_date = new Date(date_parts[2], date_parts[1], date_parts[0]);
        post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
      }

      if ([invoice_no, amount, post_date, category, supplier, currency].includes(NaN)) {
        console.log([invoice_no, amount, post_date, category, supplier, currency]);
      }

      var query = "INSERT INTO accounts_payable_all (invoice_num, invoice_amount, post_date, category, vendor_name, currency) VALUES " +
      "(?, ?, ?, ?, ?, ?);";
      connection.query(query, [invoice_no, amount, post_date, category, supplier, currency], function(error, results, fields) {
        if (error) throw error;
      });

      csvStream.resume();
    })
    .on("end", function(data) {
      console.log("done");

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

  allSpend: function (callback) {
    var query = "select currency, sum(invoice_amount), extract(year from post_date) as year from accounts_payable_all group by extract(year from post_date), currency order by post_date;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },


  // Category sqlQueries
  suppliersPerCategory: function (callback) {
    var query = "select count(distinct vendor_name) as vendors, category from accounts_payable_all group by category order by count(distinct vendor_name) desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendPerCategory: function (callback) {
    var query = "select sum(invoice_amount) as spend, category from accounts_payable_all group by category order by spend desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  transactionsPerCategory: function (callback) {
    var query = "select category, count(distinct invoice_num) as transactions from accounts_payable_all group by category order by transactions desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  spendDistributionPerCategory: function (callback) {
    var query = "select vendor_name, round((A.t/B.t) * 100, 2) as distribution from (select category, sum(invoice_amount) as t from accounts_payable_all group by category) as A" +
    "cross join (select sum(invoice_amount) as t from accounts_payable_all) as B order by distribution desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  positiveChangeinSpendPerCategory: function (start_date, end_date, callback) {
    var query = "select A.category, round(((B.amount - A.amount)/A.amount)*100, 2) as percent_change from" +
      "(select sum(invoice_amount) as amount, category, extract(year from post_date) as year from accounts_payable_all where extract(year from post_date)=? group by category, extract(year from post_date)) as A" +
      "join (select sum(invoice_amount) as amount, category, extract(year from post_date) as year from accounts_payable_all where extract(year from post_date)=? group by category, extract(year from post_date)) as B" +
      "where A.category = B.category having percent_change > 0 order by percent_change desc;";
    connection.query(query, [start_date, end_date], function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  },

  negativeChangeinSpendPerCategory: function (start_date, end_date, callback) {
    var query = "select A.category, round(((B.amount - A.amount)/A.amount)*100, 2) as percent_change from" +
      "(select sum(invoice_amount) as amount, category, extract(year from post_date) as year from accounts_payable_all where extract(year from post_date)=start_date group by category, extract(year from post_date)) as A" +
      "join (select sum(invoice_amount) as amount, category, extract(year from post_date) as year from accounts_payable_all where extract(year from post_date)=end_date group by category, extract(year from post_date)) as B" +
      "where A.category = B.category having percent_change < 0 order by percent_change desc;";
    connection.query(query, [start_date, end_date], function(error, results, fields) {
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

  spendTransactionScatter: function (callback) {
    var query = "select F.vendor_name, round(F.amount,2) as amount, F.transactions, case when F.fav < F.sav then 'true' else 'false' end as outlier from (select B.vendor_name, B.amount, B.transactions, round(B.amount/B.transactions, 2) as fav, round(C.av,2) as sav from (select vendor_name, sum(invoice_amount) as amount, count(invoice_num) as transactions, round(sum(invoice_amount)/count(invoice_num),2) as p from accounts_payable_all group by vendor_name) as B cross join (select avg(p) as av from (select vendor_name, sum(invoice_amount) as amount, count(invoice_num) as transactions, round(sum(invoice_amount)/count(invoice_num),2) as p from accounts_payable_all group by vendor_name) as A) as C) as F order by amount desc;";
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
  }

};

// set @one_number:=0;
// set @two_number:=0;
// select tone.vendor_name, tone.d, ttwo.d, tone.a, ttwo.a, (ttwo.a - tone.a)/tone.a from
// (select vendor_name, d, a, (@one_number:=@one_number + 1) as num from (select vendor_name, extract(year_month from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year_month from post_date) order by vendor_name, extract(year_month from post_date)) as A) as tone
// join (select vendor_name, d, a, (@two_number:=@two_number + 1) as num from (select vendor_name, extract(year_month from post_date) as d, sum(invoice_amount) as a from accounts_payable_all group by vendor_name, extract(year_month from post_date) order by vendor_name, extract(year_month from post_date)) as A) as ttwo
// on tone.vendor_name = ttwo.vendor_name and tone.num = ttwo.num - 1;




module.exports = sqlQueries;
