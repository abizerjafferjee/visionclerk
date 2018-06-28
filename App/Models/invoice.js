var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');

var invoiceSchema = new mongoose.Schema({
  currency: {type: String},
  text: {type: String},
  amount_total: {type: String},
  amount_due: {type: String},
  invoice_id: {type: String},
  order_id: {type: String},
  customer_id: {type: String},
  date_issue: {type: String},
  date_due: {type: String},
  terms: {type:String},
  sender_name: {type: String},
  processingId: {type: String},
  validated: {type: Boolean},
  processed: {type: Boolean},
  originalFileName: {type: String},
  fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Invoice", invoiceSchema);
