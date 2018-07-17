var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var File = require('../Models/file.js');
var Contract = require('../Models/contract.js');
var Discovery = require('watson-developer-cloud/discovery/v1');
var NaturalLanguageUnderstanding = require('watson-developer-cloud/natural-language-understanding/v1');
var fs = require('fs');
var pdf = require('pdf-parse');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');

// Watson NLU configurations
var nlu = new NaturalLanguageUnderstanding({
  version: '2018-03-16',
  username: 'aee0a4d0-4895-42a3-a683-85314107f463',
  password: 'Bv5Vux8OhgB4'
});

router.post('/upload', function(req, res) {

  // upload files uploads file to storage, if successful it uploads to watson
  // and stores in mongo
  helpers.uploads.contractUpload(req, res, function(err) {
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

        var filesProcessed = req.files.length;
        // if files are uploaded to diskStorage; iterate through each file
        // store file to storage and mongo
        // send to nlu and store call back to mongo
        for (var i=0; i<req.files.length; i++) {


          var filePath = req.files[i].path;
          var originalName = req.files[i].originalname;

          var fileRecord = {
            fileName: req.files[i].filename,
            originalName: req.files[i].originalname,
            filePath: req.files[i].path,
            size: req.files[i].size,
            date: Date.now(),
            type: 'contract',
            user: req.user,
          };

          // write to mongo
          File.create(fileRecord, function(err, file) {
            if (err) {
              filesProcessed =- 1;
            } else {

              var currentFile = file;
              var dataBuffer = fs.readFileSync(currentFile.filePath);
              // parse pdf
              pdf(dataBuffer).then(function(data) {

                var fileInfo = data.info;
                var fileText = data.text.replace(/(\r\n\t|\n|\r\t)/gm," ");
                var parameters = {
                  'text': fileText,
                  'features': {
                    'entities': {
                      'model': '10:c5970b88-7d27-492e-9d42-ed58a9d916e9'
                    }
                  }
                };
                // analyze using watson
                nlu.analyze(parameters, function(err, response) {
                  if (err) {
                    filesProcessed -= 1;
                  } else {
                    var contractDoc = helpers.uploads.createContractDoc(req, currentFile, response.entities);
                    // create Contract Record and stores to mongodb
                    Contract.create(contractDoc, function(err, extract) {
                      if (err) {
                        filesProcessed -= 1;
                      } else {
                        // update file
                        File.findById(extract.fileRef, function(err, file) {
                          if (err) {
                            filesProcessed -= 1;
                          } else {
                            file.contract = extract;
                            file.save();
                            filesProcessed -= 1;
                          }
                          if (filesProcessed === 0) {
                            res.json({success: true, message: "file uploaded and processed"});
                          }
                        });
                      }
                    });
                  }
                  if (filesProcessed === 0) {
                    res.json({success: true, message: "file uploaded and processed"});
                  }
                });
              });
            }
            if (filesProcessed === 0) {
              res.json({success: true, message: "file uploaded and processed"});
            }
          });
        }
      }
    }
  });
});

router.get('/files', function(req, res) {
  File.find({user:req.user, "processedFile.type":"contract"}, function(err, files) {
    res.send(files);
  });
});

router.get('/contracts', function(req, res) {
  Contract.find({user:req.user, validated:true}, function(err, contracts) {
    res.send(contracts);
  });
});

router.get('/unvalidatedContracts', function(req, res) {
  Contract.find({user:req.user, validated: false}, function(err, contracts) {
    res.send(contracts);
  });
});

router.post('/edit', function(req, res) {
  Contract.findByIdAndUpdate(req.body.contract._id, req.body.contract, function(err, newContract) {
    if(err) {
      res.json({success: false});
    } else {
      res.json({success: true});
    }
  });
});

router.post('/validate', function(req, res) {
  Contract.findByIdAndUpdate(req.body.id, {$set:{validated:true}}, function(err, newContract) {
    if(err) {
      res.json({success: false});
    } else {
      console.log(newContract);
      //console.log(newContract.contractor);
      // Insert into SQL database
      sql.writeContractToSQL(newContract);
      res.json({success: true});
    }
  });
});

router.post('/deleteFile', function(req, res) {
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

router.post('/deleteContract', function(req, res) {
  Contract.findById({_id:req.body.contractId}, function(err, contract) {
    if (err) {
      res.json({success:false});
    } else {
      if (contract.originalFile.fileRef !== undefined) {
        var fileId = contract.originalFile.fileRef;
        File.findOneAndRemove({_id:fileId}, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
      contract.remove();
      res.json({success: true});
    }
  });
});

module.exports = router;
