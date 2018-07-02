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
  port: 8000
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
      console.log(post_date);
      if (post_date.includes("-")) {
        var date_parts = data["POST_DATE"].split("-");
        // post_date = new Date(date_parts[2], date_parts[1], date_parts[0]);
        post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
      } else if (post_date.includes("/")) {
        var date_parts = data["POST_DATE"].split("/");
        // post_date = new Date(date_parts[2], date_parts[1], date_parts[0]);
        post_date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
      }

      // post_date = post_date.getFullYear() + '/' + post_date.getMonth() +'/' + post_date.getDate();

      console.log(post_date);

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

  duplicateSpend: function(callback) {
    var query = "SELECT invoice_num, vendor_name, count(*) from accounts_payable_all group by invoice_num, vendor_name having count(*) > 1";
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

  suppliersPerCategory: function (callback) {
    var query = "select count(distinct vendor_name) as vendors, category from accounts_payable_all group by category order by count(distinct vendor_name) desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  spendPerSupplier: function (callback) {
    var query = "select sum(invoice_amount) as spend, vendor_name from accounts_payable_all group by vendor_name order by sum(invoice_amount) desc;"
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  spendDistributionPerSupplier: function (callback) {
    var query = "select vendor_name, (A.amount/B.amount) * 100 as distribution from (select vendor_name, sum(invoice_amount) as amount from accounts_payable_all group by vendor_name) as A cross join" +
                "(select sum(invoice_amount) as amount from accounts_payable_all) as B order by distribution desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  spendDistributionPerSupplier: function (callback) {
    var query = "select vendor_name, (A.amount/B.amount) * 100 as distribution from (select vendor_name, sum(invoice_amount) as amount from accounts_payable_all group by vendor_name) as A cross join" +
                "(select sum(invoice_amount) as amount from accounts_payable_all) as B order by distribution desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  transactionsPerSupplier: function (callback) {
    var query = "select vendor_name, count(distinct invoice_num) as transactions from accounts_payable_all group by vendor_name order by transactions desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  transactionsDistributionPerSupplier: function (callback) {
    var query = "select vendor_name, round((A.t/B.t) * 100, 2) as distribution from (select vendor_name, count(distinct invoice_amount) as t from accounts_payable_all group by vendor_name) as A" +
    "cross join (select count(distinct invoice_amount) as t from accounts_payable_all) as B order by distribution desc;";
    connection.query(query, function(error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }


};




module.exports = sqlQueries;
