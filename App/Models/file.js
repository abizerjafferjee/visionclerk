var mongoose = require("mongoose");
var validate = require('mongoose-validator');

var fileSchema = new mongoose.Schema({
  fileName: {type: String, required: true},
  originalName: {type: String, required: true},
  filePath: {type: String, required: true},
  size: {type: Number},
  date: {type: Date, required: true},
  processedFile: {
    contract: {
      fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"Contract"},
      extracted: {type: Boolean}
    },
    invoice: {
      extracted: {type: Boolean}
    }
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
});

module.exports = mongoose.model("File", fileSchema);
