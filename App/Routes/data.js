var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');


router.get('/files/read', function(req, res) {
  File.find({user: req.user}, function(err, files) {
    res.send(files);
  });
});

router.post('/files/delete', function(req, res) {
  File.findOne({_id:req.body.fileId}, function(err, file) {
    if (err) {
      res.json({success:false});
    } else {
      if (file.processedFile.contract.fileRef !== undefined) {
        var extractId = file.processedFile.contract.fileRef;
        Contract.findOneAndRemove({_id:extractId}, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
      file.remove();
      res.json({success: true});
    }
  });
});


module.exports = router;
