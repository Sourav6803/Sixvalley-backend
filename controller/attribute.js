const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const attributeModel = require("../model/attribute")
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const User = require("../model/user")

const mongoose = require('mongoose')


router.post("/create-attribute", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {

    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const { name } = req.body;

    const isAttributeExist = await attributeModel.find({
      name: name,
    });


    if (!name ) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
   

    if (isAttributeExist.length !== 0) {
      return next(new ErrorHandler("Attribute already exists!", 400));
    }

    const attribute = {
      name: name,
    }

    const data = await attributeModel.create(attribute);

    res.status(201).json({
      success: true,
      message: "Attribute created",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-attribute/:id", catchAsyncErrors(async (req, res, next) => {
  try {
    // const admin = await User.findById(req.admin.id)

    // if (!admin) {
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const attributeId = req.params.id

    if (!mongoose.isValidObjectId(attributeId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const attribute = await attributeModel.findById(attributeId)


    if (!attribute) {
      return next(new ErrorHandler("No Attribute found with this id", 400));
    }

    return res.status(200).json({ message: "Attribute Fetched Succesfully!", attribute })
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-all-attribute", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id) 

    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await attributeModel.find()

    res.status(200).json({
      success: true,
      message: "Attribute fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.put("/update-attribute/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const attributeId = req.params.id;
    if (!mongoose.isValidObjectId(attributeId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const attribute = await attributeModel.findById(attributeId);
    if (!attribute) {
      return next(new ErrorHandler("No Attribute found with this id", 400));
    }


    const { name } = req.body;

    if (name != null) {
      const existName = await attributeModel.findOne({ name });
      if (existName && existName._id.toString() !== attributeId) {
        return next(new ErrorHandler("Already a attribute exists with this name", 400));
      }
      attribute.name = name;
    }

    await attribute.save();
    res.status(200).json({ success: true, attribute });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))


router.delete("/delete-attribute/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id)

    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const attributeId = req.params.id
    if (!mongoose.isValidObjectId(attributeId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const attribute = await attributeModel.findById(attributeId)

    if (!attribute) {
      return next(new ErrorHandler("No attribute found with this id", 400));
    }

    await attributeModel.findByIdAndDelete(attributeId)

    return res.status(201).json({
      success: true,
      message: "Attribute deleted successfully!",
    });

  }
  catch (err) {
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;