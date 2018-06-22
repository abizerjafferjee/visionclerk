var mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
  category: String,
  industry: String,
  content: String,
  products: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
});

module.exports = mongoose.model("Category", categorySchema);
