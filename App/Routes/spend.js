var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');


router.post('/upload', function(req, res) {

  // Store Invoice File (one or many) to Destination
  helpers.uploads.spendUpload(req, res, function(err) {
    if(err) {
      if (err.code === 'filetype') {
        res.json({success: false, message: "File type is invalid. Upload csv, xls"});
      } else {
        res.json({ success: false, message: "Something went wrong. Please try again."});
      }
    } else {
      if (req.files === undefined) {
        res.json({success: false, message: "No files. Please select files."});
      } else {
        // Iterate Over Files
        for (var i=0; i<req.files.length; i++) {
          var filesProcessed = req.files.length;
          var fileRecord = helpers.uploads.createSpendDoc(req, i);
          // Write File to MongoDB File
          File.create(fileRecord, function(err, file) {
            if (err) {
              filesProcessed -= 1;
            } else {
              sql.writeAPtoSQL(file);
              filesProcessed -= 1;
            }
            if (filesProcessed === 0) {
              res.json({success: true, message: "Uploads Complete"});
            }
          });
        }
      }
    }
  });
});

router.get('/files/read', function(req, res) {
  File.find({user: req.user, type: "spend"}, function(err, files) {
    sql.infoPerSource(files, function(files, results) {
      for (var i=0; i<files.length; i++) {
        for (var j=0; j<results.length; j++) {
          if (String(files[i]._id) === results[j].source_id) {

            var file = {_id:files[i]._id, fileName: files[i].fileName, originalName: files[i].originalName, filePath: files[i].filePath,
            size: files[i].size, date: files[i].date, type: files[i].type, user: files[i].user, currency: results[j].currency,
            min_date: results[j].min_date, max_date: results[j].max_date, total: results[j].total, num_lines: results[j].num_lines};

            files[i] = file;
          }
        }
      }
      res.send(files);
    })
  });
});

router.delete('/files/delete/:id', function(req, res) {
  sql.deleteBySource(req.params.id, function(results) {
    File.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
        res.json({success:false});
      } else {
        res.json({success: true});
      }
    });
  })
});

router.get('/files/schema', function(req, res) {
  res.sendFile(path.join(__dirname, '../../Downloads/SCHEMA.csv'));
})


module.exports = router;
