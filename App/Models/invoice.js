var mongoose = require("mongoose");
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');


var invoiceSchema = new mongoose.Schema({
  currency: {type: String},
  text: {type: String},
  fields: {
    amount_total: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    amount_total_base: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    amount_total_tax: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    amount_rounding: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    amount_paid: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    amount_due: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    tax_details: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    // tax_details_base: [String],
    // tax_detail_rate: [String],
    // tax_detail_tax: [String],
    // tax_detail_total: [String],
    invoice_id: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    order_id: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    customer_id: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    date_issue: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    date_due: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    terms: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    sender_name: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    sender_addrline: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    sender_dic: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    recipient_name: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }],
    recipient_addrline: [{
      title: {type: String},
      content: {type: String},
      value: {type: String},
      value_type: {type: String}
    }]
  },
  processingId: {type: String},
  processStatus: {type: Boolean},
  originalFile: {
    fileName: {type: String},
    fileRef: {type: mongoose.Schema.Types.ObjectId, ref:"File"}
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("Invoice", invoiceSchema);
