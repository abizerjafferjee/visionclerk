var mongoose = require("mongoose");
var validate = require("mongoose-validator");

var resourceSchema = new mongoose.Schema({	
	uid: {type: Number},
	_user_f_key: {type: Number},
	_pointer: {type: Object},
	owner: {type: String}
});

module.exports = mongoose.model("Resource", resourceSchema);
