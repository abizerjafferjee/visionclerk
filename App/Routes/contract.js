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

// Watson NLU configurations
var nlu = new NaturalLanguageUnderstanding({
  version: '2018-03-16',
  username: 'aee0a4d0-4895-42a3-a683-85314107f463',
  password: 'Bv5Vux8OhgB4'
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

        // if files are uploaded to diskStorage; iterate through each file
        // store file to storage and mongo
        // send to nlu and store call back to mongo
        for (var i=0; i<req.files.length; i++) {

          var filesProcessed = req.files.length;

          var filePath = req.files[i].path;
          var originalName = req.files[i].originalname;

          var fileRecord = {
            fileName: req.files[i].filename,
            originalName: req.files[i].originalname,
            filePath: req.files[i].path,
            size: req.files[i].size,
            date: Date.now(),
            processedFile: {
              type: "contract",
              contract: {
                extracted: false
              }
            },
            user: req.user,
          };

          // write to mongo
          File.create(fileRecord, function(err, file) {
            if (err) {
              console.log(err);
            } else {

              var currentFile = file;
              var dataBuffer = fs.readFileSync(currentFile.filePath);

              // parse pdf
              pdf(dataBuffer).then(function(data) {

                var fileInfo = data.info;
                var fileText = data.text;
                var parameters = {
                  'text': fileText,
                  'features': {
                    // 'metadata': {},
                    'entities': {
                      'mentions': true,
                      'limit': 4
                    }
                  }
                };

                // analyze using watson
                nlu.analyze(parameters, function(err, response) {
                  if (err) {
                    console.log(err);
                  } else {
                    var extractRecord = {
                      organization: '',
                      party: '',
                      party: '',
                      identifier: '',
                      item: '',
                      quantity: '',
                      events: '',
                      other: '',
                      validated: false,
                      originalFile: {
                        fileName: currentFile.originalName,
                        fileRef: currentFile,
                      },
                      user: req.user
                    };

                    var entities = response.entities;

                    for (var i=0; i<entities.length; i++) {
                      var entity = entities[i];
                      if (['Company', 'Facility', 'Broadcaster', 'Organization', 'PrintMedia'].includes(entity.type)) {
                        extractRecord['organization'] += entity.text.toLowerCase() + ', ';
                      } else if (['Person', 'MusicGroup', 'TelevisionShow'].includes(entity.type)) {
                        extractRecord['party'] += entity.text.toLowerCase() + ', ';
                      } else if (['EmailAddress', 'IPAddress', 'Location', 'GeographicFeature', 'JobTitle'].includes(entity.type)) {
                        extractRecord['identifier'] += entity.text.toLowerCase() + ', ';
                      } else if (['Anatomy', 'Drug', 'HealthCondition'].includes(entity.type)) {
                        extractRecord['item'] += entity.text.toLowerCase() + ', ';
                      } else if (['Quantity'].includes(entity.type)) {
                        extractRecord['quantity'] += entity.text.toLowerCase() + ', ';
                      } else if (['SportingEvent', 'Sport', 'Crime', 'NaturalEvent'].includes(entity.type)) {
                        extractRecord['events'] += entity.text.toLowerCase() + ', ';
                      } else {
                        extractRecord['other'] += entity.text.toLowerCase() + ', ';
                      }
                    }

                    // add to fileExtract
                    Contract.create(extractRecord, function(err, extract) {
                      if (err) {
                        console.log(err);
                      } else {
                        // update file
                        File.findById(extract.originalFile.fileRef, function(err, file) {
                          if (err) {
                            console.log(err);
                          } else {
                            file.processedFile.contract.fileRef = extract;
                            file.processedFile.contract.extracted = true;
                            file.save();
                          }
                          filesProcessed -= 1;
                          if (filesProcessed === 0) {
                            res.json({success: true, message: "file successfully uploaded"});
                          }
                        });
                      }
                    });
                  }
                });
              });
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
