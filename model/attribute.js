const mongoose = require( "mongoose");

const attributeScheema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    

}, {timestamps: true})


attributeScheema.index({ name: 'text' });

module.exports = mongoose.model("Attribute", attributeScheema)