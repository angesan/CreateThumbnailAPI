const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    filename:{type:String , required:true},
    thumbnailFileName:{type:String, default:''},
    originalImage: {type:String,required:true},
    states:{type:String,required:true}
});

module.exports = mongoose.model('Image', imageSchema)