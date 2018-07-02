var express = require('express');
var router = express.Router();
var path = require('path');
var File = require('../Models/file.js');
var Invoice = require('../Models/invoice.js');
var fs = require('fs');
var pdf = require('pdf-parse');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var FormData = require('form-data');
var request = require('request');
var helpers = require('../Routes/helpers.js');
var sql = require('../Routes/sql.js');

ROSSUM = 'dlKlseLLZdHMkHRfwdHCxipMoGWCOcCIGEXDXfB0fGaHJ6ZX7Qgt7YSzoF4roZ2r';

router.post('/rossum/upload', function(req, res) {

  // Store Invoice File (one or many) to Destination
  helpers.uploads.invoiceUpload(req, res, function(err) {
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

        // Iterate Over Files
        for (var i=0; i<req.files.length; i++) {
          var filesProcessed = req.files.length;
          var fileRecord = helpers.uploads.createInvoiceFile(req, i);
          // Write File to MongoDB File
          File.create(fileRecord, function(err, file) {
            if (err) {
              console.log(err);
            } else {
              var currentFile = file;
              var formData = {
                file: fs.createReadStream(file.filePath),
              };
              // Send File to Rossum
              request.post({url:'https://all.rir.rossum.ai/document', headers:{'Authorization': 'secret_key ' + ROSSUM, 'Content-Type': 'multipart/form-data'}, formData: formData}, function(err, httpResponse, body) {
                if (err) {
                  console.log('upload failed:', err);
                } else {
                  var resp = JSON.parse(body);
                  var invoiceRecord = {
                    processingId: resp.id,
                    processed: false,
                    originalFileName: currentFile.originalName,
                    fileRef: currentFile,
                    user: req.user
                  };
                  // Write Invoice to MongoDB Invoice
                  Invoice.create(invoiceRecord, function(err, invoice) {
                    if (err) {
                      console.log(err);
                    } else {
                      currentFile.invoice = invoice;
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

router.get('/rossum/process', function(req, res) {
  // Get Invoices Not Processed
  Invoice.find({processed: false}, function(err, invoices) {
    if (err) {
      res.json({success: false, message: "Something went wrong"});
    } else {
      if (invoices.length != 0) {
        var filesLoop = invoices.length;
        var notProcessed = 0;
        // Iterate Over Unprocessed Invoices
        for (var i=0; i< invoices.length; i++) {
          var currentInvoice = invoices[i];
          // Request Processed Invoiced From Rossum
          request.get({url:'https://all.rir.rossum.ai/document/' + invoices[i].processingId, headers:{'Authorization': 'secret_key ' + ROSSUM}}, function(err, httpResponse, body) {
            if (err) {
              notProcessed += 1;
            } else {
              response = JSON.parse(body);
              if (response.status !== "processing") {
                // set currency
                currentInvoice.currency = response.currency;
                // set extract fields
                responseFields = response.fields;
                for (var i=0; i < responseFields.length; i++) {
                  if (['terms', 'sender_name'].includes(responseFields[i].name)){
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
                }
                // set validated false
                currentInvoice.validated = false;
                // set full text
                var full_text = response.full_text.content.join(' ');
                currentInvoice.text = full_text;
                // set processed equals true
                currentInvoice.processed = true;
                currentInvoice.save();
              } else {
                notProcessed += 1;
              }
            }
            filesLoop -= 1;
            if (filesLoop === 0) {
              res.json({success: true, notProcessed: notProcessed});
            }
          });
        }
      } else {
        res.json({success: true, notProcessed: 0});
      }
    }
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



router.post('/update', function(req, res) {
  Invoice.findByIdAndUpdate({_id: req.body.invoice._id}, req.body.invoice, function(err, newInvoice) {
    if(err) {
      res.json({success:false, message: "Something went wrong"});
    } else {
      res.json({success: true, message: "Invoice updated"});
    }
  });
});

router.post('/validate', function(req, res) {
  Invoice.findByIdAndUpdate({_id: req.body.id}, {$set:{validated: true}}, function(err, newInvoice) {
    if(err) {
      res.json({success: false, message: "Could not validate"})
    } else {
      // Write Invoice to SQL
      sql.writeInvoicetoSQL(newInvoice);
      res.json({success: true, message: "Validated and saved"})
    }
  });
});

router.post('/rossum/feedback', function(req, res) {

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
        res.json({success: false, message: "Something went wrong"});
      } else {
        var resp = JSON.parse(body);
        res.json({success: true, message: "feedback sent successfully"});
      }
  });
});

module.exports = router;
