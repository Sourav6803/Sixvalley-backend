const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../model/category");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../model/user")
const { upload } = require("../app")
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');

router.post("/importCategory", catchAsyncErrors(async (req, res, next) => {
  try {
    // Correct path to your JSON file

    const filePath = path.join(__dirname, '..', 'category.json'); // Update path accordingly
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    } // Update this path accordingly
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const categoryss = JSON.parse(jsonData);

    // Insert data into MongoDB
    await Category.insertMany(categoryss);

    res.status(200).json({
      success: true,
      message: 'Category imported successfully',
    });
  } catch (error) {
    console.error('Error importing brands:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing brands',
      error: error.message
    });
  }
}));


router.post("/create-category", isAdmin, upload.single('image'), catchAsyncErrors(async (req, res, next) => {
  try {
    const isCategoryExist = await Category.find({
      name: req.body.name,
    });

    if (isCategoryExist.length !== 0) {
      return next(new ErrorHandler("Category already exists!", 400));
    }

    const imageFile = req.file;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "category" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(imageFile.buffer);

    });



    const category = {
      name: req.body.name,
      priroity: req.body.priroity,
      image: {
        public_id: result.public_id,
        url: result.secure_url
      },
    }

    const data = await Category.create(category);

    res.status(201).json({
      success: true,
      message: "Category created",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-category/:id", isAdmin, catchAsyncErrors(async(req,res,next)=>{
  try{
    const admin = await User.findById(req.admin.id) 
   
    if(!admin){
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const categoryId = req.params.id

    if (!mongoose.isValidObjectId(categoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const category = await Category.findById(categoryId)

    if (!category) {
      return next(new ErrorHandler("No Category found with this id", 400));
    }

    return res.status(200).json({message: "Category Fetched Succesfully!", category})
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-all-category", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id) 
   
    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await Category.find();

    res.status(200).json({
      success: true,
      message: "Category fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/search", catchAsyncErrors(async (req, res) => {
  const searchText = req.query.q;
  if (!searchText) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const categories = await Category.find({
      $text: { $search: searchText }
    });
    res.status(200).json(categories);
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.put("/update-category/:id", isAdmin,upload.single('image'), catchAsyncErrors(async(req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const categoryId = req.params.id;
    if (!mongoose.isValidObjectId(categoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ErrorHandler("No Category found with this id", 400));
    }

    const image = req.file;
    const { name, priroity } = req.body;

    if (name != null) {
      const existName = await Category.findOne({ name });
      if (existName && existName._id.toString() !== categoryId) {
        return next(new ErrorHandler("Already a category exists with this name", 400));
      }
      category.name = name;
    }

    if (priroity != null) {
      category.priroity = priroity;
    }

    if (image) {
      if (category?.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "category" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(image.buffer);
      });

      category.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))


router.delete("/delete-category/:id", isAdmin, catchAsyncErrors(async(req,res,next)=>{
  try{
    const admin = await User.findById(req.admin.id) 
   
    if(!admin){
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const categoryId = req.params.id
    if (!mongoose.isValidObjectId(categoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const category = await Category.findById(categoryId)

    if (!category) {
      return next(new ErrorHandler("No Category found with this id", 400));
    }

    if (category?.image?.public_id) {
      await cloudinary.uploader.destroy(category?.image?.public_id);
    }

    await Category.findByIdAndDelete(categoryId)

     return res.status(201).json({
      success: true,
      message: "Category deleted successfully!",
    });

  }
  catch(err){
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;