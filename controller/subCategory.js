const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const User = require("../model/user")
const { upload } = require("../app")
const mongoose = require('mongoose')

const fs = require('fs');
const path = require('path');




router.post("/importSubCategory", catchAsyncErrors(async (req, res, next) => {
  try {
    // Correct path to your JSON file

    const filePath = path.join(__dirname, '..', 'subcategory.json'); // Update path accordingly
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    } // Update this path accordingly
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const suCategory = JSON.parse(jsonData);

    // Insert data into MongoDB
    await SubCategory.insertMany(suCategory);

    res.status(200).json({
      success: true,
      message: 'Sub Category imported successfully',
    });
  } catch (error) {
    console.error('Error importing suCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing suCategory',
      error: error.message
    });
  }
}));


router.post("/create-subCategory", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {

    console.log("from req.body ",req.body)

    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const { name, priority, mainCategory } = req.body;

    const isSubCategoryExist = await SubCategory.find({
      name: name,
    });

    console.log("name:", name)
    console.log("priority:", priority)
    console.log("mainCategory:", mainCategory)

    if (!name || !priority || !mainCategory) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
   

    if (isSubCategoryExist.length !== 0) {
      return next(new ErrorHandler("Sub Category already exists!", 400));
    }

    const subCategory = {
      name: name,
      priority: priority,
      mainCategory: mainCategory,

    }

    const data = await SubCategory.create(subCategory);

    res.status(201).json({
      success: true,
      message: "Sub Category created",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-subCategory/:id", catchAsyncErrors(async (req, res, next) => {
  try {
    // const admin = await User.findById(req.admin.id)

    // if (!admin) {
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const subCategoryId = req.params.id

    if (!mongoose.isValidObjectId(subCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subCategory = await SubCategory.findById(subCategoryId)


    if (!subCategory) {
      return next(new ErrorHandler("No Sub-ategory found with this id", 400));
    }

    return res.status(200).json({ message: "Sub-category Fetched Succesfully!", subCategory })
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-all-subCategory", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id) 

    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await SubCategory.find()

    res.status(200).json({
      success: true,
      message: "Sub-category fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))





router.put("/update-subCategory/:id", isAdmin, upload.single('image'), catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const subCategoryId = req.params.id;
    if (!mongoose.isValidObjectId(subCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return next(new ErrorHandler("No Sub-category found with this id", 400));
    }


    const { name, priroity } = req.body;

    if (name != null) {
      const existName = await SubCategory.findOne({ name });
      if (existName && existName._id.toString() !== subCategoryId) {
        return next(new ErrorHandler("Already a Sub category exists with this name", 400));
      }
      subCategory.name = name;
    }

    if (priroity != null) {
      subCategory.priroity = priroity;
    }

    await subCategory.save();
    res.status(200).json({ success: true, subCategory });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))


router.delete("/delete-subCategory/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id)

    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const subCategoryId = req.params.id
    if (!mongoose.isValidObjectId(subCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subCategory = await SubCategory.findById(subCategoryId)

    if (!subCategory) {
      return next(new ErrorHandler("No Sub-category found with this id", 400));
    }



    await SubCategory.findByIdAndDelete(subCategoryId)

    return res.status(201).json({
      success: true,
      message: "Sub Category deleted successfully!",
    });

  }
  catch (err) {
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;