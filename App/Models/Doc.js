var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');

var DocSchema = new Schema({
    name: { type: String, required: true, unique: false, lowercase: true },
    type: { type: String, required: false, unique: false, lowercase: false },
    size: { type: Number, required: true, default: 0 },
    path: { type: String, required: true, unique: true }
});

DocSchema.pre('save', function(next) {
    var user = this;
    next();
});

DocSchema.methods.read = function(){
    return fs.createReadStream(this.path);
};

module.exports = mongoose.model('Doc', DocSchema);
