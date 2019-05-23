const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require("path");

const queue = require('../../new_task')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString() + file.originalname)
    }
});

const fileFilter = (req,file,cb) => {
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        req.fileValidationError = 'File type is not acceptable';
        cb(null,false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter

});

const status = {
    WORKING: 'working',
    COMPLETED: 'completed',
    ERROR: 'error'
}


const Image = require('../models/image');


router.get('/', (req,res,next) => {
    Image.find()
    .select('filename originalImage')
    .exec()
    .then(docs => {
        console.log(docs);
        const response ={
            count: docs.length,
            Image: docs.map(doc => {
                return {
                    filename: doc.filename,
                    originalImage:doc.originalImage,
                    _id: doc._id,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/image/'+ doc._id +'/thumbnail'
                    }
                }
            })
        }
        res.status(200).json(response);
 
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error :err});
    });
});

router.post('/', upload.single('image'), (req,res,next) => {
    console.log(req.file);
    if(req.fileValidationError) {
        res.status(400).json({
            error:req.fileValidationError
        });
    }
    const image = new Image({
        _id: new mongoose.Types.ObjectId(),
        originalImage:req.file.originalname,
        thumbnailFileName: '',
        filename: req.file.filename,
        states: status.WORKING
    });
    image
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message:'Image upload successfully',
            thumbnailURL: 'http://localhost:3000/image/'+ result._id + '/thumbnail'
        });
        return result;
    })
    .then(
        result => {
            queue.postMessage(result._id.toString())
        }
    )
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        });
    });
});

router.get('/:imageId/thumbnail',(req,res,next) => {
    const id = req.params.imageId;
    Image.findById(id)
    .select('filename originalImage states thumbnailFileName')
    .exec()
    .then(doc => {
        console.log("From database",doc);
        if(doc){
            switch(doc.states){
                case status.WORKING:
                    res.status(200).json({
                        message: 'still working on resizing, please access url below later',
                        thumbnailURL: 'http://localhost:3000/image/'+ doc._id + '/thumbnail'
                    })
                    break;
                case status.COMPLETED:
                    res.sendFile(path.join(__dirname, '../../uploads/', doc.thumbnailFileName));
                    break;
                case status.ERROR:
                    res.status(200).json({
                        message: 'Something wrong happen, please contact administrator',
                    })
                    break;
            }
        }else{
            res.status(404).json({message:'No valid entry found provided ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
});

module.exports = router;