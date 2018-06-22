var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  company: String,
  logo: String,
  company_desc: String,
  product: String,
  product_img: String,
  content: String,
  category: String,
  industry: String,
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "Category"}
});

module.exports = mongoose.model("Product", productSchema);
