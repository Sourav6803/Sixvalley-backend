const mongoose = require("mongoose");

const subCategoryScheema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    priority: String,
    mainCategory: String
    

}, { timestamps: true })




module.exports = mongoose.model("SubCategory", subCategoryScheema)