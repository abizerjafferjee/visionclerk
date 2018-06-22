var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var File = require('../Models/file.js');
var Invoice = require('../Models/invoice.js');
var fs = require('fs');
var pdf = require('pdf-parse');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var FormData = require('form-data');
var request = require('request');

ROSSUM = 'dlKlseLLZdHMkHRfwdHCxipMoGWCOcCIGEXDXfB0fGaHJ6ZX7Qgt7YSzoF4roZ2r';

// multer function to store a file
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|doc|docx|html|png)$/)) {
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
              type: "invoice",
              invoice: {
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

              var formData = {
                file: fs.createReadStream(file.filePath),
              };

              request.post({url:'https://all.rir.rossum.ai/document', headers:{'Authorization': 'secret_key ' + ROSSUM, 'Content-Type': 'multipart/form-data'}, formData: formData}, function(err, httpResponse, body) {
                if (err) {
                  console.log('upload failed:', err);
                } else {
                  var resp = JSON.parse(body);

                  var invoiceRecord = {
                    processingId: resp.id,
                    processStatus: false,
                    originalFileName: currentFile.originalName,
                    fileRef: currentFile,
                    user: req.user
                  };

                  Invoice.create(invoiceRecord, function(err, invoice) {
                    if (err) {
                      console.log(err);
                    } else {
                      currentFile.processedFile.invoice.fileRef = invoice;
                      currentFile.save();
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

        }
      }
    }
  });
});

router.get('/process', function(req, res) {
  Invoice.find({processStatus: false}, function(err, invoices) {

    if (err) {
      res.json({success: false, message: "something went wrong"});
    } else {
      var filesProcessed = invoices.length;
      // console.log(invoices);

      for (var i=0; i< invoices.length; i++) {

        var currentInvoice = invoices[i]

        request.get({url:'https://all.rir.rossum.ai/document/' + invoices[i].processingId, headers:{'Authorization': 'secret_key ' + ROSSUM}}, function(err, httpResponse, body) {
          if (err) {
            console.log(err);
          } else {

            response = JSON.parse(body);
            console.log(response);

            if (response.status !== "processing") {

              // set currency
              currentInvoice.currency = response.currency;

              // set extract fields
              responseFields = response.fields;
              for (var i=0; i < responseFields.length; i++) {
                if (['terms', 'sender_name', 'sender_addrline', 'sender_dic', 'recipient_name', 'recipient_addrline'].includes(responseFields[i].name)){
                  if (currentInvoice[responseFields[i].name] == undefined) {
                    currentInvoice[responseFields[i].name] = responseFields[i].value;
                  } else {
                    currentInvoice[responseFields[i].name] += ', ' + responseFields[i].value;
                  }
                } else {
                  if (currentInvoice[responseFields[i].name] == undefined) {
                    currentInvoice[responseFields[i].name] = responseFields[i].value;
                  }
                }
                if (responseFields[i].name == "tax_details") {
                  console.log(responseFields[i].content)
                }
              }

              // set validated false
              currentInvoice.validated = false;

              // set full text
              var full_text = response.full_text.content.join(' ');
              currentInvoice.text = full_text;

              // set processed equals true
              currentInvoice.processStatus = true;

              currentInvoice.save();

              // file set invoice processed equals true
              File.findById(currentInvoice.fileRef, function(err, file) {
                file.processedFile.invoice.extracted = true;
                file.save();
              });

            }

          }

          filesProcessed -= 1;
          if (filesProcessed === 0) {
            res.json({success: true, message: "file successfully uploaded"});
          }

        });

      }

    }

  });
});

router.get('/files', function(req, res) {
  File.find({user: req.user, "processedFile.type":"invoice"}, function(err, files) {
    res.send(files);
  });
});

router.get('/invoices', function(req, res) {
  Invoice.find({user:req.user, validated: true}, function(err, invoices) {
    res.send(invoices);
  });
});

router.get('/unvalidatedInvoices', function(req, res) {
  Invoice.find({user:req.user, validated: false}, function(err, invoices) {
    res.send(invoices);
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

router.post('/edit', function(req, res) {
  console.log(req.body.invoice);
  Invoice.findByIdAndUpdate({_id: req.body.invoice._id}, req.body.invoice, function(err, newInvoice) {
    if(err) {
      console.log(err);
    } else {
      console.log(newInvoice);
    }
    res.json({success:"done"});
  });

});

router.post('/validate', function(req, res) {
  console.log(req.body.invoice);
  Invoice.findByIdAndUpdate({_id: req.body.id}, {$set:{validated: true}}, function(err, newInvoice) {
    if(err) {
      console.log(err);
    } else {
      console.log(newInvoice);
    }
    res.json({success:"done"});
  });

});

router.post('/feedback', function(req, res) {

  var form = {
    'result': 'incorrect',
    'fields': [req.body.field]
  };

  request.put({
    url:'https://all.rir.rossum.ai/document/' + req.body.id + '/feedback',
    headers:{'Authorization': 'secret_key ' + ROSSUM, 'Content-Type': 'application/json'},
    form: form}, function(err, httpResponse, body) {
    if (err) {
      console.log('upload failed:', err);
    } else {
      var resp = JSON.parse(body);
    }
  });

});




module.exports = router;
