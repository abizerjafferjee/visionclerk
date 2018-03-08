var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt   = require('bcrypt');
var validate = require('mongoose-validator');

// VALIDATES EMAIL
var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Not a valid e-mail'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 100],
    message: 'Email must be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

// VALIDATES USERNAME
var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username must be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Username must only contain letters and numbers'
  })
];

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
    message: 'Password must have at least one lower case, one upper case, one number, one speacil character, and must be at least 8 characters but not more than 35'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 35],
    message: 'Password must be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, validate: emailValidator },
  username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValidator },
  password: { type: String, required: true, validate: passwordValidator, select: false },
  active: { type: Boolean, required: true, default: false },
  temporarytoken: { type: String, required: true},
  resettoken: { type: String, required: false }
});

UserSchema.pre('save', function(next) {
  var user = this;

  // if password has not changed, then move on
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
