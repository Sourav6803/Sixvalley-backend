const mongoose = require( "mongoose");

const categoryScheema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    priroity: Number,
    image:{
        public_id: String,
        url: String,
        _id: false
     },

}, {timestamps: true})


categoryScheema.index({ name: 'text' });

module.exports = mongoose.model("Category", categoryScheema)