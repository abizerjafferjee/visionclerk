var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');


var fileExtractSchema = new mongoose.Schema({
  watsonId: {type: String, required: true},
  file: {type: mongoose.Schema.Types.ObjectId, ref:"File"},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
});

module.exports = mongoose.model("FileExtract", fileExtractSchema);
