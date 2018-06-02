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
                      organization: [],
                      party: [],
                      party: [],
                      identifier: [],
                      item: [],
                      quantity: [],
                      events: [],
                      other: [],
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
                        extractRecord['organization'].push(entity.text);
                      } else if (['Person', 'MusicGroup', 'TelevisionShow'].includes(entity.type)) {
                        extractRecord['party'].push(entity.text);
                      } else if (['EmailAddress', 'IPAddress', 'Location', 'GeographicFeature', 'JobTitle'].includes(entity.type)) {
                        extractRecord['identifier'].push(entity.text);
                      } else if (['Anatomy', 'Drug', 'HealthCondition'].includes(entity.type)) {
                        extractRecord['item'].push(entity.text);
                      } else if (['Quantity'].includes(entity.type)) {
                        extractRecord['quantity'].push(entity.text);
                      } else if (['SportingEvent', 'Sport', 'Crime', 'NaturalEvent'].includes(entity.type)) {
                        extractRecord['events'].push(entity.text);
                      } else {
                        extractRecord['other'].push(entity.text);
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
  Contract.find({user:req.user}, function(err, contracts) {
    res.send(contracts);
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
  Contract.findOne({_id:req.body.contractId}, function(err, contract) {
    if (err) {
      res.json({success:false});
    }
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
  });
});

module.exports = router;


// Watson discovery configurations

// environment_id = '18d60b1b-d3eb-4a55-9a9b-0fd9a3281aa7';
// collection_id = 'e451432f-0f2f-4488-bea7-9ac7763d528d';
// configuration_id = 'b79654d2-76d8-48e1-be0b-5601a9738daf';
//
// var discovery = new Discovery({
//   version: '2018-03-05',
//   username: '0878e83e-37b8-4e8a-bd8f-9be48e1ac754',
//   password: 'YGCfaBJTwi3S'
// });

// THESE ARE THE UPLOAD AND EXTRACT ROUTE I USED FOR DISCOVERY
//
// router.post('/upload', function(req, res) {
//
//   // upload files uploads file to storage, if successful it uploads to watson
//   // and stores in mongo
//   upload(req, res, function(err) {
//
//     if(err) {
//
//       if (err.code === 'filetype') {
//         res.json({success: false, message: "File type is invalid. Upload pdf, word, html."});
//       } else {
//         res.json({ success: false, message: "Something went wrong. Please try again."});
//       }
//
//     } else {
//
//       if (req.files === undefined) {
//         res.json({success: false, message: "No files. Please select files."});
//       } else {
//         response = {success: true, message: "file successfully uploaded", files:[]};
//
//         // if files are uploaded to diskStorage
//         // iterate through each file
//         // upload to watson and get document id
//         // store file details, watson id and user id to mongo
//         for (var i=0; i<req.files.length; i++) {
//
//           var fileRecord = {};
//
//           var filePath = req.files[i].path;
//           var originalName = req.files[i].originalname;
//
//           fileRecord["filePath"] = filePath;
//           fileRecord["originalName"] = originalName;
//           fileRecord["fileName"] = req.files[i].filename;
//           fileRecord["size"] = req.files[i].size;
//           fileRecord["user"] = req.user;
//           fileRecord["date"] = Date.now();
//           // Date.day();
//           fileRecord["fileExtracted"] = false;
//
//           response.files.push({filename: originalName});
//
//           // write to mongo
//           File.create(fileRecord, function(err, file) {
//             if (err) {
//               response.files[originalName] = "Something went wrong. Please try again";
//             } else {
//
//               // upload document to watson
//               var watsonFile = fs.readFileSync(file.filePath);
//
//               discovery.addDocument({
//                 environment_id: environment_id,
//                 collection_id: collection_id,
//                 file: watsonFile
//               },function(error, data) {
//
//                 if (error) {
//                   console.log(error);
//
//                 } else {
//                   file["watsonId"] = data["document_id"];
//                   file.save();
//
//                 }
//               });
//
//             }
//           });
//
//         }
//
//         res.json(response);
//         // queryCollection();
//       }
//     }
//   });
//
// });
//
// router.get('/extract', function(req, res) {
//   File.find({user:req.user, fileExtracted:false}, function(err, files) {
//
//     if (err) {
//       console.log(err);
//       res.json({success:false});
//     } else {
//       // console.log(files);
//       var filesProcessed = files.length;
//
//       // iterate through all the files not processed
//       for (var i=0; i < files.length; i++) {
//
//         parameters = {environment_id: environment_id, collection_id: collection_id,
//                   natural_language_query: "", filter: 'id::"' + files[i].watsonId + '"'};
//
//         // console.log(parameters.filter);
//         var thisFile = files[i];
//         var watsonId = files[i].watsonId;
//         var originalName = files[i].originalName;
//         // console.log("1st print", originalName);
//
//         discovery.query(parameters, function(error, data) {
//           // console.log(data.results);
//           if (error) {
//             console.log(error);
//           } else {
//
//             if (data.matching_results !== 0) {
//
//               var extractRecord = {};
//
//               extractRecord.watsonId = data.results[0].id;
//               // extractRecord.file = thisFile;
//               extractRecord.user = req.user;
//               // extractRecord.fileName = originalName;
//               extractRecord.company = data.results[0].extracted_metadata.author;
//               extractRecord.publicationDate = data.results[0].extracted_metadata.publicationdate;
//
//               FileExtract.create(extractRecord, function(err, fileExtract) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   File.find({watsonId: fileExtract.watsonId}, function(err, updateFile) {
//                     if (err) {
//                       console.log(err);
//                       // res.json({success:false});
//                     } else {
//                       updateFile[0].file = fileExtract;
//                       updateFile[0].fileExtracted = true;
//                       updateFile[0].save();
//                       FileExtract.findById(fileExtract._id, function(err, oldFile) {
//                         oldFile.file = updateFile;
//                         oldFile.fileName = updateFile.originalName;
//                         oldFile.save();
//                       });
//                     }
//                   });
//                 }
//               });
//             }
//           }
//
//           filesProcessed -= 1;
//           if (filesProcessed === 0) {
//             res.json({success:true});
//           }
//
//         });
//       }
//     }
//   });
// });

// THIS IS AN EXTRACT ALTERNATIVE FOR NLU
//
// router.get('/newextract', function(req, res) {
//
//   File.find({user:req.user, fileExtracted:false}, function(err, files) {
//     if (err) {
//       console.log(err);
//       res.json({success:false});
//     } else {
//       var filesProcessed = files.length;
//       // iterate through all the files not processed
//       for (var i=0; i < files.length; i++) {
//         var currentFile = files[i];
//         var dataBuffer = fs.readFileSync(currentFile.filePath);
//
//         pdf(dataBuffer).then(function(data) {
//           var fileInfo = data.info;
//           var fileText = data.text;
//           var parameters = {
//             'text': fileText,
//             'features': {
//               'entities': {
//                 'mentions': true,
//                 'limit': 2
//               }
//             }
//           };
//
//           nlu.analyze(parameters, function(err, response) {
//             if (err) {
//               console.log(err);
//             } else {
//               console.log(response);
//               var extractRecord = {};
//               extractRecord['company'] = response.entities[0].type + response.entities[0].text;
//               extractRecord['publicationDate'] = fileInfo.CreationDate;
//               extractRecord['fileName'] = currentFile.originalName;
//               extractRecord['file'] = currentFile;
//               extractRecord['user'] = req.user;
//
//               FileExtract.create(extractRecord, function(err, extract) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   File.findById(extract.file, function(err, file) {
//                     if (err) {
//                       console.log(err);
//                     } else {
//                       file.file = extract;
//                       file.fileExtracted = true;
//                       file.save();
//                     }
//                     filesProcessed -= 1;
//                     if (filesProcessed === 0) {
//                       res.json({success:true});
//                     }
//                   });
//                 }
//               });
//             }
//           });
//         });
//       }
//     }
//   });
// });
