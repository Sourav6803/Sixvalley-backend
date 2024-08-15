const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Brand = require("../model/brand");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../model/user")
const { upload } = require("../app")
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');




router.post("/create-brand", isAdmin, upload.single('brandLogo'), catchAsyncErrors(async (req, res, next) => {
  try {
    const isBrandExist = await Brand.find({
      brandName: req.body.brandName,
    });

    if (isBrandExist.length !== 0) {
      return next(new ErrorHandler("Brand already exists!", 400));
    }
    const brandLogo = req.file;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "brand" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(brandLogo.buffer);

    });

    const brand = {
      brandName: req.body.brandName,
      brandLogo: {
        public_id: result.public_id,
        url: result.secure_url
      },
    }
    console.log(brand)

    const data = await Brand.create(brand);

    res.status(201).json({
      success: true,
      message: "Brand created Successfully",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))





router.post("/importBrands", catchAsyncErrors(async (req, res, next) => {
  try {
    // Correct path to your JSON file

    const filePath = path.join(__dirname, '..', 'brands.json'); // Update path accordingly
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    } // Update this path accordingly
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const brands = JSON.parse(jsonData);

    // Insert data into MongoDB
    await Brand.insertMany(brands);

    res.status(200).json({
      success: true,
      message: 'Brands imported successfully',
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

router.get("/get-brand/:id", catchAsyncErrors(async (req, res, next) => {
  try {
    // const admin = await User.findById(req.admin.id) 

    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const brandId = req.params.id

    if (!mongoose.isValidObjectId(brandId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const brand = await Brand.findById(brandId)

    if (!brand) {
      return next(new ErrorHandler("No Brand found with this id", 400));
    }

    return res.status(200).json({ message: "brand Fetched Succesfully!", brand })
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-all-brand", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id) 

    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await Brand.find();

    res.status(200).json({
      success: true,
      message: "Brand fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.put("/update-brand/:id", isAdmin, upload.single('brandLogo'), catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const brandId = req.params.id;
    if (!mongoose.isValidObjectId(brandId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new ErrorHandler("No Brand found with this id", 400));
    }

    const brandLogo = req.file;
    const { brandName } = req.body;

    if (brandName != null) {
      const existName = await Brand.findOne({ brandName });
      if (existName && existName._id.toString() !== brandId) {
        return next(new ErrorHandler("Already a Brand exists with this name", 400));
      }
      brand.brandName = brandName;
    }

    if (brandLogo) {
      if (brand?.brandLogo?.public_id) {
        await cloudinary.uploader.destroy(brand.brandLogo.public_id);
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "brand" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(brandLogo.buffer);
      });

      brand.brandLogo = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await brand.save();
    res.status(200).json({ success: true, brand });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))


router.delete("/delete-brand/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id)

    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const brandId = req.params.id
    if (!mongoose.isValidObjectId(brandId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const brand = await Brand.findById(brandId)

    if (!brand) {
      return next(new ErrorHandler("No Brand found with this id", 400));
    }

    if (brand?.brandLogo?.public_id) {
      await cloudinary.uploader.destroy(brand?.brandLogo?.public_id);
    }

    await Brand.findByIdAndDelete(brandId)

    return res.status(201).json({
      success: true,
      message: "Brand deleted successfully!",
    });

  }
  catch (err) {
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;