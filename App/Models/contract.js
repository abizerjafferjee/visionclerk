var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');

var contractSchema = new mongoose.Schema({
  reference_number: {type: String},
  title: {type: String},
  short_description: {type: String},
  organization: [String],
  contracting_authority: {type: String},
  contractor: {type: String},
  date: [String],
  start_date: {type: String},
  end_date: {type: String},
  dispatch_date: {type: String},
  contract_end_date: {type: String},
  person: [String],
  contact_person: {type: String},
  address: [String],
  contractor_address: {type: String},
  validated: {type: Boolean},
  originalFileName: {type: String},
  fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Contract", contractSchema);
