import express from 'express';
import Resource from '../Models/resource';
let router = express.Router({});

router.get('/res_info', function (req, res) {
    Resource.find({id: req.id}, function (err, info) {
        if (err) {
            res.json({success: false, message: 'Resource not found.'});
        } else {
            res.json({success: true, resource: info});
        }
    });
});

router.post('/create_res', function (req, res) {
    // todo : set proper param
    let new_res = new Resource(req);
    new_res.save()
        .then(doc => {
            res.json({success: true, msg: doc});
        })
        .catch(err => {
            res.json({success: false, msg: err});
        });
});

router.put('/update_res', function (req, res) {
    // TODO : Check id
    // TODO : Synch with access permissions
    let new_res = new Resource(req);
    new_res.save()
        .then(doc => {
            res.json({success: true, msg: doc});
        })
        .catch(err => {
            res.json({success: false, msg: err});
        });
});