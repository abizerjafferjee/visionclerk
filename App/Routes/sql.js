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

      console.log(data["DATE OF INVOICE"]);
      var date_parts = data["DATE OF INVOICE"].split("-");
      var post_date = new Date(date_parts[2], date_parts[1], date_parts[0]);
      var amount = Number(data["VAT INCLUSIVE"]);
      // console.log(amount);
      var query = "INSERT INTO accounts_payable_all (invoice_num, invoice_amount, post_date, category, vendor_name) VALUES " +
      "(?, ?, ?, ?, ?);";
      connection.query(query, [data["INVOICE NO"], amount, post_date, data["DESCRIPTION OF GOODS"], data["SUPPLIER"]], function(error, results, fields) {
        if (error) throw error;
        // console.log(results);
      });

      csvStream.resume();
    })
    .on("end", function(data) {
      console.log(dic);

    });

  }
};




module.exports = sqlQueries;
