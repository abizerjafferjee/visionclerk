var Access = require("./Models/access.js")
var Account = require("./Models/account.js")

var access = {

  canAccess: function(resource_name, role_name, permission, user) {
    Access.findOne({resource_name:resource_name, role_name:role_name, 'permission.permission':true}, function(err, access) {
      if (err) {
        return false;
      } else {
        Account.findOne({user: user._id}, function(err, user) {
          if (err) {
            return false;
          } else {
            if (user.access_ids.includes(access._id)) {
              return true;
            } else {
              return false;
            }
          }
        });
      }
    });
  }

};

module.exports = access;
