var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);


// // validate email
// var emailValidator = [
//   validate({
//     validator: 'isEmail',
//     message: 'Not a valid email.'
//   }),
//   validate({
//     validator: 'isLength',
//     arguments: [3, 100],
//     message: 'Email must be between {ARGS[0]} and {ARGS[1]} characters.'
//   })
// ];
//
// // validate username
// var usernameValidator = [
//   validate({
//     validator: 'isLength',
//     arguments: [3, 25],
//     message: 'Username must be between {ARGS[0]} and {ARGS[1]} characters'
//   }),
//   validate({
//     validator: 'isAlphanumeric',
//     message: 'Username must only contain letters and numbers'
//   })
// ];
//
// // validate password
// var passwordValidator = [
//   validate({
//     validator: 'matches',
//     arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
//     message: 'Password must have at least one lower case, one upper case, one number, one speacil character, and must be at least 8 characters but not more than 35'
//   }),
//   validate({
//     validator: 'isLength',
//     arguments: [8, 35],
//     message: 'Password must be between {ARGS[0]} and {ARGS[1]} characters'
//   })
// ];
//
// // user schema
// var UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true, lowercase: true },
//   username: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true, select: false }
// });

// UserSchema.plugin(passportLocalMongoose);

// user schema
// var UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true, lowercase: true, validate: emailValidator },
//   username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValidator },
//   password: { type: String, required: true, validate: passwordValidator, select: false },
//   active: { type: Boolean, required: true, default: false },
//   temporarytoken: { type: String, required: true},
//   resettoken: { type: String, required: false }
// });
