var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');


var invoiceSchema = new mongoose.Schema({
  currency: {type: String},
  text: {type: String},
  amount_total: {type: String},
  amount_total_base: {type: String},
  amount_total_tax: {type: String},
  amount_rounding: {type: String},
  amount_paid: {type: String},
  amount_due: {type: String},
  // tax_details: [{
  //   title: {type: String},
  //   content: {type: String},
  //   value: {type: String},
  //   value_type: {type: String}
  // }],
  // tax_details_base: [String],
  // tax_detail_rate: [String],
  // tax_detail_tax: [String],
  // tax_detail_total: [String],
  invoice_id: {type: String},
  order_id: {type: String},
  customer_id: {type: String},
  date_issue: {type: String},
  date_due: {type: String},
  terms: {type:String},
  sender_name: {type: String},
  sender_addrline: {type: String},
  sender_dic: {type: String},
  recipient_name: {type: String},
  recipient_addrline: {type: String},
  validated: {type: Boolean},
  processingId: {type: String},
  processStatus: {type: Boolean},
  originalFileName: {type: String},
  fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Invoice", invoiceSchema);
