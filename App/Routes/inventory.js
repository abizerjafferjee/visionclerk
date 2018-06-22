var express = require('express');
var router = express.Router();
var Category = require('../Models/category.js');
var Product = require('../Models/product.js');

router.post('/createCategory', function(req, res) {

  Category.create(req.body.category, function(err, category) {
    if (err) {
      res.json({success: false, message: "Could not create category. Please try again."});
    } else {
      res.json({success: true});
    }
  });
});

router.get('/categories', function(req, res) {

  Category.find({}, function(err, categories) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true, categories:categories});
    }
  });
});

router.get('/categories/:category_id', function(req, res) {
  Category.findById(req.params.category_id, function(err, category) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true, data:category});
    }
  });
});

router.post('/createProduct', function(req, res) {

  Product.create(req.body.data, function(err, product) {
    if (err) {
      res.json({success: false, message: "Could not create product. Please try again."});
    } else {
      Category.findById(product.category_id, function(err, category) {
        if (err) {
          res.json({success: false, message: "Could not update category with new product"});
        } else {
          category.products.push(product);
          category.save();
          res.json({success: true})
        }
      });
    }
  });
});

router.get('/products', function(req, res) {

  Product.find({}, function(err, products) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true, data:products});
    }
  });
});

router.post('/updateCategory', function(req, res) {
  Category.findById(req.body.id, function(err, category) {
    if (err) {
      res.json({success:false, message:"could not update category"});
    } else{
      category.category = req.body.data.category;
      category.industry = req.body.data.industry;
      category.content = req.body.data.content;
      category.save();
      res.json({success:true});
    }
  });
});

router.post('/deleteCategory', function(req, res) {
  Category.findByIdAndRemove(req.body.id, function(err) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true});
    }
  });
});

router.post('/deleteProduct', function(req, res) {
  Product.findByIdAndRemove(req.body.id, function(err) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true});
    }
  });
});

router.get('/products/:product_id', function(req, res) {
  Product.findById(req.params.product_id, function(err, product) {
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true, data:product});
    }
  });
});

router.post('/updateProduct', function(req, res) {
  Product.findById(req.body.id, function(err, product) {
    if (err) {
      res.json({success:false, message:"Could not update Product"});
    } else {
      product.company = req.body.data.company;
      product.logo = req.body.data.logo;
      product.company_desc = req.body.data.company_desc;
      product.product = req.body.data.product;
      product.product_img = req.body.data.product_img;
      product.content = req.body.data.content;
      product.category = req.body.data.category;
      product.industry = req.body.data.industry;
      product.save();
      res.json({success:true});
    }
  });
})



module.exports = router;
