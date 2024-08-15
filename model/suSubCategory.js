const mongoose = require("mongoose");

const subSubCategoryScheema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    priority: String,
    mainCategory: {
        type: String
    },
    subCategory: {
        type: String
    },
    image: {
        public_id: String,
        url: String,
        _id: false
    },

}, { timestamps: true })



module.exports = mongoose.model("SubSubCategory", subSubCategoryScheema)