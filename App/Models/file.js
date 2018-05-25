var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');


var fileSchema = new mongoose.Schema({
  filePath: {type: String, required: true},
  originalName: {type: String, required: true},
  fileName: {type: String, required: true},
  size: {type: Number},
  date: {type: Date, required: true},
  watsonId: {type: String},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
  file: {type: mongoose.Schema.Types.ObjectId, ref:"FileExtract"},
  fileExtracted: {type: Boolean}
});

module.exports = mongoose.model("File", fileSchema);
