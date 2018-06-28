var multer = require('multer');

// multer function to store an invoice file
var invoiceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|png|jpg)$/)) {
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

// multer middleware function for storage and limits configurations for invoices
var invoiceUpload = multer({storage: invoiceStorage}).array("uploads[]");

// multer function to store a contract file
var contractStorage = multer.diskStorage({
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

// multer middleware function for storage and limits configurations for contracts
var contractUpload = multer({storage: contractStorage}).array("uploads[]");


// multer function to store a contract file
var spendStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    if (!file.originalname.match(/\.(xls|csv)$/)) {
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

// multer middleware function for storage and limits configurations for contracts
var spendUpload = multer({storage: spendStorage}).array("uploads[]");

var uploads = {

  invoiceUpload: invoiceUpload,

  createInvoiceFile: function(req, i) {
    var fileRecord = {
      fileName: req.files[i].filename,
      originalName: req.files[i].originalname,
      filePath: req.files[i].path,
      size: req.files[i].size,
      date: Date.now(),
      type: "invoice",
      user: req.user,
    };

    return fileRecord;
  },

  contractUpload: contractUpload,

  createContractDoc: function(req, currentFile, entities) {

    var contractDoc = {
      reference_number: '',
      title: '',
      short_description: '',
      organization: [],
      contracting_authority: '',
      contractor: '',
      date: [],
      start_date: '',
      end_date: '',
      dispatch_date: '',
      contract_end_date: '',
      person: [],
      contact_person: '',
      address: [],
      contractor_address: '',
      validated: false,
      originalFileName: currentFile.originalName,
      fileRef: currentFile,
      user: req.user
    };

    for (var i=0; i < entities.length; i++) {
      if (entities[i].type == 'organization') {
        contractDoc.organization.push(entities[i].text);
      } else if (entities[i].type == 'date') {
        contractDoc.date.push(entities[i].text);
      } else if (entities[i].type == 'person') {
        contractDoc.person.push(entities[i].text);
      } else if (entities[i].type == 'address') {
        contractDoc.address.push(entities[i].text);
      } else if (entities[i].type == 'title') {
        if (contractDoc.title == '') {
          contractDoc.title = entities[i].text;
        } else {
          contractDoc.title += ', ' + entities[i].text;
        }
      } else if (entities[i].type == 'reference_number') {
        if (contractDoc.reference_number == '') {
          contractDoc.reference_number = entities[i].text;
        } else {
          contractDoc.reference_number += ', ' + entities[i].text;
        }
      } else if (entities[i].type == 'short_description') {
        if (contractDoc.short_description == '') {
          contractDoc.short_description = entities[i].text;
        } else {
          contractDoc.short_description += ', ' + entities[i].text;
        }
      }
    }

    return contractDoc;

  },

  spendUpload: spendUpload,

  createSpendDoc: function(req, i) {
    var fileRecord = {
      fileName: req.files[i].filename,
      originalName: req.files[i].originalname,
      filePath: req.files[i].path,
      size: req.files[i].size,
      date: Date.now(),
      type: "spend",
      user: req.user,
    };

    return fileRecord;
  },

};

var helpers = {
  uploads: uploads,

}

module.exports = helpers;
