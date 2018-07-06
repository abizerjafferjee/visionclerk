var express = require('express');
var router = express.Router();
var Category = require('../Models/category.js');
var Product = require('../Models/product.js');
var ac = require('../Models/access.js')

router.post('/createCategory', function(req, res) {
  const permission = ac.can(req.user.role).createAny('products');
  if (permission.granted){
    Category.create(req.body.category, function(err, category) {
      if (err) {
        res.json({success: false, message: "Could not create category. Please try again."});
      } else {
        res.json({success: true});
      }
    });
  } else {
    res.json({success:false, message:"You don't have permission"});
  }
});

router.get('/categories', function(req, res) {
  const permission = ac.can(req.user.role).readAny('products');
  if (permission.granted) {
    Category.find({}, function(err, categories) {
      if (err) {
        res.json({success: false, message:"Something went wrong"});
      } else {
        res.json({success: true, categories:categories});
      }
    });
  } else {
    res.json({success: false, message:"You don't have access."});
  }

});

router.get('/categories/:category_id', function(req, res) {
  const permission = ac.can(req.user.role).readAny('products');
  if (permission.granted){
    Category.findById(req.params.category_id, function(err, category) {
      if (err) {
        res.json({success: false, message:"Something went wrong"});
      } else {
        res.json({success: true, data:category});
      }
    });
  } else {
    res.json({success: false, message: "You don't have access"});
  }

});

router.post('/createProduct', function(req, res) {
  const permission = ac.can(req.user.role).createAny('products');
  if (permission.granted) {
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
  } else {
    res.json({success: false, message: "You don't have permission"})
  }
});

router.get('/products', function(req, res) {
  const permission = ac.can(req.user.role).readAny('products');
  if (permission.granted) {
    Product.find({}, function(err, products) {
      if (err) {
        res.json({success: false, message:"Something went wrong"});
      } else {
        res.json({success: true, data:products});
      }
    });
  } else {
    res.json({success: false, message: "You dont have access"});
  }

});

router.post('/updateCategory', function(req, res) {
  const permission = ac.can(req.user.role).updateAny('products');
  if (permission.granted) {
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
  } else {
    res.json({success: false, message: "You don't have permission"});
  }

});

router.post('/deleteCategory', function(req, res) {
  const permission = ac.can(req.user.role).deleteAny('products');
  if (permission.granted) {
    Category.findByIdAndRemove(req.body.id, function(err) {
      if (err) {
        res.json({success: false, message:"Something went wrong"});
      } else {
        res.json({success: true});
      }
    });
  } else {
    res.json({success: false, message: "You don't have permission"});
  }
});

router.post('/deleteProduct', function(req, res) {
  const permission = ac.can(req.user.role).deleteAny('products');
  if (permission.granted) {
    Product.findByIdAndRemove(req.body.id, function(err) {
      if (err) {
        res.json({success: false, message: "Something went wrong"});
      } else {
        res.json({success: true});
      }
    });
  } else {
    res.json({success: false, message: "You don't have permission"});
  }
});

router.get('/products/:product_id', function(req, res) {
  const permission = ac.can(req.user.role).readAny('products');
  if (permission.granted) {
    Product.findById(req.params.product_id, function(err, product) {
      if (err) {
        res.json({success: false, message: "Something went wrong"});
      } else {
        res.json({success: true, data:product});
      }
    });
  } else {
    res.json({success: false, message: "You don't have access"});
  }
});

router.get('/products/category/:category_id', function(req, res) {
  const permission = ac.can(req.user.role).readAny('products');
  if (permission.granted) {
    Product.find({'category_id': req.params.category_id}, function(err, products) {
      if (err) {
        res.json({success: false});
      } else {
        res.json({success: true, data:products});
      }
    });
  } else {
    res.json({success: false, message: "You don't have access"});
  }
});


router.post('/updateProduct', function(req, res) {
  const permission = ac.can(req.user.role).updateAny('products');
  if (permission.granted) {
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
  } else {
    res.json({success: false, message: "You don't have permission"});
  }

});



module.exports = router;
