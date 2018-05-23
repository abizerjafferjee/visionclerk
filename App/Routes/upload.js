var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var File = require('../models/file.js');
var FileExtract = require('../models/fileExtract.js');
var Discovery = require('watson-developer-cloud/discovery/v1');
var fs = require('fs');

// FileExtract.create({watsonId:"234nj4n534jk", file:null, user:null}, function(err, file) {});

// Watson configurations

environment_id = '18d60b1b-d3eb-4a55-9a9b-0fd9a3281aa7';
collection_id = 'e451432f-0f2f-4488-bea7-9ac7763d528d';
configuration_id = 'b79654d2-76d8-48e1-be0b-5601a9738daf';

var discovery = new Discovery({
  version: '2018-03-05',
  username: '0878e83e-37b8-4e8a-bd8f-9be48e1ac754',
  password: 'YGCfaBJTwi3S'
});

// multer function to store a file
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|doc|docx|html)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    } else {
      var fileName = Date.now() + '_' + file.originalname;
      var relPath = '/uploads/' + fileName;
      cb(null, fileName);
    }
  }
});

// multer middleware function for storage and limits configurations
var upload = multer({storage: storage}).array("uploads[]");

router.post('/upload', function(req, res) {
  //this array stores file records from mongo for files which have been uploaded
  var uploadedFilesArray= [];

  // upload files uploads file to storage, if successful it uploads to watson
  // and stores in mongo
  upload(req, res, function(err) {

    if(err) {

      if (err.code === 'filetype') {
        res.json({success: false, message: "File type is invalid. Upload pdf, word, html."});
      } else {
        res.json({ success: false, message: "Something went wrong. Please try again."});
      }

    } else {

      if (req.files === undefined) {
        res.json({success: false, message: "No files. Please select files."});
      } else {
        response = {success: true, message: "file successfully uploaded", files:[]};

        // if files are uploaded to diskStorage
        // iterate through each file
        // upload to watson and get document id
        // store file details, watson id and user id to mongo
        for (var i=0; i<req.files.length; i++) {

          var fileRecord = {};

          var filePath = req.files[i].path;
          var originalName = req.files[i].originalname;

          fileRecord["filePath"] = filePath;
          fileRecord["originalName"] = originalName;
          fileRecord["fileName"] = req.files[i].filename;
          fileRecord["size"] = req.files[i].size;
          fileRecord["user"] = req.user;
          fileRecord["fileExtracted"] = false;

          response.files.push({filename: originalName});

          // write to mongo
          File.create(fileRecord, function(err, file) {
            if (err) {
              response.files[originalName] = "Something went wrong. Please try again";
            } else {

              // upload document to watson
              var watsonFile = fs.readFileSync(file.filePath);

              discovery.addDocument({
                environment_id: environment_id,
                collection_id: collection_id,
                file: watsonFile
              },function(error, data) {

                if (error) {
                  console.log(error);

                } else {
                  file["watsonId"] = data["document_id"];
                  file.save();

                }
              });

            }
          });

        }

        res.json(response);
        // queryCollection();
      }
    }
  });

});

router.get('/extract', function(req, res) {
  File.find({user:req.user, fileExtracted:false}, function(err, files) {

    if (err) {
      console.log(err);
      res.json({success:false});
    } else {

      var filesProcessed = files.length;

      for (var i=0; i < files.length; i++) {

        parameters = {environment_id: environment_id, collection_id: collection_id,
                  natural_language_query: "", filter: 'id::"' + files[i].watsonId + '"'};

        // console.log(parameters.filter);
        var thisFile = files[i];
        var watsonId = files[i].watsonId;
        var originalName = files[i].originalName;

        discovery.query(parameters, function(error, data) {

          if (error) {
            console.log(error);
          } else {

            if (data.matching_results !== 0) {

              FileExtract.create({watsonId:data.results[0].id, file:thisFile, user:req.user}, function(err, fileExtract) {

                if (err) {
                  console.log(err);
                } else {
                  File.findById(thisFile._id, function(err, updateFile) {

                    if (err) {
                      console.log(err);
                      res.json({success:false});
                    } else {
                      updateFile.file = fileExtract;
                      updateFile.fileExtracted = true;
                      updateFile.save();
                    }

                  });
                }
              });
            }
          }

          filesProcessed -= 1;
          if (filesProcessed === 0) {
            res.json({success:true});
          }

        });
      }
    }
  });
});

router.get('/files', function(req, res) {
  File.find({user:req.user}, function(err, files) {
    res.send(files);
  });
});


module.exports = router;
