const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const SubSubCategory = require("../model/suSubCategory")
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const User = require("../model/user")
const mongoose = require('mongoose');
const cloudinary = require("cloudinary").v2;
const { upload } = require("../app")

router.post("/create-subSubCategory", isAdmin,upload.single('image'), catchAsyncErrors(async (req, res, next) => {
  try {


    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const { name, priority, mainCategory, subCategory } = req.body;

    const isSubSubCategoryExist = await SubSubCategory.find({
      name: name,
    });

    // if (!name || !priority || !mainCategory || subCategory) {
    //   return res.status(400).json({ success: false, message: "All fields are required *." });
    // }

    if (isSubSubCategoryExist.length !== 0) {
      return next(new ErrorHandler("Sub sub Category already exists!", 400));
    }

    const imageFile = req.file;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "subSubCategory" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(imageFile.buffer);

    });

    const subSubCategory = {
      name: name,
      priority: priority,
      mainCategory: mainCategory,
      subCategory: subCategory,
      image: {
        public_id: result.public_id,
        url: result.secure_url
      },
    }

    const data = await SubSubCategory.create(subSubCategory);

    res.status(201).json({
      success: true,
      message: "Sub Sub-Category created",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-subSubCategory/:id", catchAsyncErrors(async (req, res, next) => {
  try {
    // const admin = await User.findById(req.admin.id)

    // if (!admin) {
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const subSubCategoryId = req.params.id

    if (!mongoose.isValidObjectId(subSubCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subSubCategory = await SubSubCategory.findById(subSubCategoryId)


    if (!subSubCategory) {
      return next(new ErrorHandler("No Sub sub-category found with this id", 400));
    }

    return res.status(200).json({ message: "Sub-Subcategory Fetched Succesfully!", subSubCategory })
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-all-subSubCategory", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id)

    // if (!admin) {
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await SubSubCategory.find()

    res.status(200).json({
      success: true,
      message: "Sub Sub-category fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))





router.put("/update-subSubCategory/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const subSubCategoryId = req.params.id;

    if (!mongoose.isValidObjectId(subSubCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subSubCategory = await SubSubCategory.findById(subSubCategoryId);
    if (!subSubCategory) {
      return next(new ErrorHandler("No Sub sub-category found with this id", 400));
    }


    const { name, priority } = req.body;

    if (name != null) {
      const existName = await SubSubCategory.findOne({ name });
      if (existName && existName._id.toString() !== subSubCategoryId) {
        return next(new ErrorHandler("Already a Sub sub-category exists with this name", 400));
      }
      subSubCategory.name = name;
    }

    if (priority != null) {
      subSubCategory.priority = priority;
    }

    await subSubCategory.save();
    res.status(200).json({ success: true, subSubCategory });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))


router.delete("/delete-subSubCategory/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id)

    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const subCategoryId = req.params.id
    if (!mongoose.isValidObjectId(subCategoryId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const subCategory = await SubSubCategory.findById(subCategoryId)

    if (!subCategory) {
      return next(new ErrorHandler("No Sub sub-category found with this id", 400));
    }



    await SubSubCategory.findByIdAndDelete(subCategoryId)

    return res.status(201).json({
      success: true,
      message: "Sub Sub-Category deleted successfully!",
    });

  }
  catch (err) {
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;