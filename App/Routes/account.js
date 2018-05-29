var express = require('express');
var router = express.Router();
var User = require('../Models/user.js');
var Account = require('../Models/account.js');

router.get('/account', function(req, res) {
  Account.find({user: req.user}, function(err, accounts) {
    if (err) {
      res.json({success: false, message:'No user found'});
    } else {
      res.json({success: true, account: accounts[0]});
    }
  });
});

router.post('/account', function(req, res) {
  Account.findByIdAndUpdate(req.body.id, {$set:req.body.account}, function(err, updatedAccount) {
    if (err) {
      res.json({success: false, message: "Could not update profile"});
    } else {
      res.json({success: true, message: "Profile updated"});
    }
  });
})

module.exports = router;
