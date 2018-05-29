var mongoose = require("mongoose");
var validate = require('mongoose-validator');

var accountSchema = new mongoose.Schema({
  firstName: {type: String},
  lastName: {type: String},
  userName: {type: String},
  organizationName: {type: String},
  organizationRole: {type: String},
  emailAddress: {type: String},
  phoneNumber: {type: String},
  role: {type: String},
  plan: {type: String},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
});

module.exports = mongoose.model("Account", accountSchema);
