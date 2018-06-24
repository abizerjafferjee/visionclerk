var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');

var contractSchema = new mongoose.Schema({
  organization: {type:String},
  party: {type:String},
  party: {type:String},
  identifier: {type:String},
  item: {type:String},
  quantity: {type:String},
  events: {type:String},
  other: {type:String},
  validated: {type: Boolean},
  originalFile: {
    fileName: {type: String},
    fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"}
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Contract", contractSchema);
