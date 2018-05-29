var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');


var contractSchema = new mongoose.Schema({
  organization: [String],
  party: [String],
  party: [String],
  identifier: [String],
  item: [String],
  quantity: [String],
  events: [String],
  other: [String],
  originalFile: {
    fileName: {type: String},
    fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"}
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Contract", contractSchema);
