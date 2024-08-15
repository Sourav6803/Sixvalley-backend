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
const FlashdealModel = require("../model/flashDeal")


router.post("/create-flashDeal", isAdmin, upload.single('image'), catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("hello")
    const isDealExist = await FlashdealModel.find({
      name: req.body.name,
    });

    if (isDealExist.length !== 0) {
      return next(new ErrorHandler("Deal already exists!", 400));
    }

    const imageFile = req.file;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "flashDeal" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(imageFile.buffer);

    });

    const flashDeal = {
      name: req.body.name,
      startDate: req.body.startDate,
      expireDate: req.body.expireDate,
      products: req.body.products,
      image: {
        public_id: result.public_id,
        url: result.secure_url
      },
    }

    const data = await FlashdealModel.create(flashDeal);

    res.status(201).json({
      success: true,
      message: "Flash deal created",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


router.get("/get-flashDeal/:id", isAdmin, catchAsyncErrors(async(req,res,next)=>{
  try{
    const admin = await User.findById(req.admin.id) 
   
    if(!admin){
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const flashDealId = req.params.id

    if (!mongoose.isValidObjectId(flashDealId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const flashDeal = await FlashdealModel.findById(flashDealId)

    if (!flashDeal) {
      return next(new ErrorHandler("No Deal found with this id", 400));
    }

    return res.status(200).json({message: "Flash deal Fetched Succesfully!", flashDeal})
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))

router.get("/get-all-flashDeal", catchAsyncErrors(async (req, res, next) => {
  try {

    // const admin = await User.findById(req.admin.id) 
   
    // if(!admin){
    //   return next(new ErrorHandler("Admin not found with this id", 400));
    // }

    const data = await FlashdealModel.find();

    res.status(200).json({
      success: true,
      message: "Flash fetched succesfully!",
      data,
    });
  }
  catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


// router.put("/update-flashDeal/:id", isAdmin,upload.single('image'), catchAsyncErrors(async(req, res, next) => {
//   try {
//     const admin = await User.findById(req.admin.id);
//     if (!admin) {
//       return next(new ErrorHandler("Admin not found with this id", 400));
//     }

//     const flashDealId = req.params.id;
//     if (!mongoose.isValidObjectId(flashDealId)) {
//       return next(new ErrorHandler("Id not valid", 400));
//     }

//     const flashDeal = await FlashdealModel.findById(flashDealId);
//     if (!flashDeal) {
//       return next(new ErrorHandler("No flashDeal found with this id", 400));
//     }

//     const image = req.file;
//     const { name, startDate, expireDate , products } = req.body;

//     if (name != null) {
//       const existName = await FlashdealModel.findOne({ name });
//       if (existName && existName._id.toString() !== flashDealId) {
//         return next(new ErrorHandler("Already a Deal exists with this name", 400));
//       }
//       flashDeal.name = name;
//     }

//     if (startDate != null) {
//       flashDeal.startDate = startDate;
//     }

//     if (expireDate != null) {
//         flashDeal.expireDate = expireDate;
//       }

//       if(products != null){
//         flashDeal.products = products
//       }

//     if (image) {
//       if (flashDeal?.image?.public_id) {
//         await cloudinary.uploader.destroy(flashDeal.image.public_id);
//       }

//       const result = await new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream({ folder: "flashDeal" }, (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }).end(image.buffer);
//       });

//       flashDeal.image = {
//         public_id: result.public_id,
//         url: result.secure_url,
//       };
//     }

//     await flashDeal.save();
//     res.status(200).json({ success: true, flashDeal });
//   } catch (error) {
//     return next(new ErrorHandler(error, 500));
//   }
// }))



router.put("/update-flashDeal/:id", isAdmin, upload.single('image'), catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) {
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const flashDealId = req.params.id;
    if (!mongoose.isValidObjectId(flashDealId)) {
      return next(new ErrorHandler("Invalid ID", 400));
    }

    const flashDeal = await FlashdealModel.findById(flashDealId);
    if (!flashDeal) {
      return next(new ErrorHandler("No flash deal found with this id", 404));
    }

    const image = req.file;
    const { name, startDate, expireDate, products } = req.body;

    if (name) {
      const existingDeal = await FlashdealModel.findOne({ name });
      if (existingDeal && existingDeal._id.toString() !== flashDealId) {
        return next(new ErrorHandler("A deal with this name already exists", 400));
      }
      flashDeal.name = name;
    }

    if (startDate) {
      if (isNaN(Date.parse(startDate))) {
        return next(new ErrorHandler("Invalid start date", 400));
      }
      flashDeal.startDate = startDate;
    }

    if (expireDate) {
      if (isNaN(Date.parse(expireDate))) {
        return next(new ErrorHandler("Invalid expire date", 400));
      }
      flashDeal.expireDate = expireDate;
    }

    if (products) {
      flashDeal.products = products;
    }

    if (image) {
      if (flashDeal?.image?.public_id) {
        await cloudinary.uploader.destroy(flashDeal.image.public_id);
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "flashDeal" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(image.buffer);
      });

      flashDeal.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await flashDeal.save();
    res.status(200).json({ success: true, flashDeal });
  } catch (error) {
    return next(new ErrorHandler(error.message || "An error occurred while updating the flash deal", 500));
  }
}));

// Route to remove a product from a flash deal by productId
// router.put("/remove-product/:flashDealId/:productId", catchAsyncErrors(async (req, res, next) => {
//   const { flashDealId, productId } = req.params;

//   try {
//     // Validate flash deal ID
//     if (!mongoose.isValidObjectId(flashDealId)) {
//       return next(new ErrorHandler("Invalid flash deal ID", 400));
//     }

//     // Validate product ID
//     if (!mongoose.isValidObjectId(productId)) {
//       return next(new ErrorHandler("Invalid product ID", 400));
//     }

//     // Fetch flash deal
//     const flashDeal = await FlashdealModel.findById(flashDealId);
//     if (!flashDeal) {
//       return next(new ErrorHandler("No flash deal found with this ID", 404));
//     }

//     // Check if product exists in the flash deal
//     const productIndex = flashDeal.products.indexOf(productId);
//     console.log("Product ID to remove:", productId);
//     console.log("Product IDs in flash deal:", flashDeal.products);

//     if (productIndex === -1) {
//       return next(new ErrorHandler("Product not found in this flash deal", 404));
//     }

//     // Remove product from the flash deal
//     flashDeal.products.splice(productIndex, 1);

//     // Save the updated flash deal
//     await flashDeal.save();

//     res.status(200).json({ success: true, message: "Product removed from flash deal", flashDeal });
//   } catch (error) {
//     return next(new ErrorHandler(error.message || "An error occurred while removing the product from the flash deal", 500));
//   }
// }));


router.put("/remove-product/:flashDealId/:productId", catchAsyncErrors(async (req, res, next) => {
  const { flashDealId, productId } = req.params;

  try {
    // Validate flash deal ID
    if (!mongoose.isValidObjectId(flashDealId)) {
      return next(new ErrorHandler("Invalid flash deal ID", 400));
    }

    // Validate product ID
    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }

    // Fetch flash deal
    const flashDeal = await FlashdealModel.findById(flashDealId);
    if (!flashDeal) {
      return next(new ErrorHandler("No flash deal found with this ID", 404));
    }

    // Check if product exists in the flash deal
    const productExists = flashDeal.products.some(prod => prod._id.toString() === productId);
   
    if (!productExists) {
      return next(new ErrorHandler("Product not found in this flash deal", 404));
    }

    // Remove product from the flash deal
    flashDeal.products = flashDeal.products.filter(prod => prod._id.toString() !== productId);
    // 

    // Save the updated flash deal
    await flashDeal.save();

    res.status(200).json({ success: true, message: "Product removed from flash deal", flashDeal });
  } catch (error) {
    return next(new ErrorHandler(error.message || "An error occurred while removing the product from the flash deal", 500));
  }
}));


router.put("/update-flashdeal-publicStatus/:id", catchAsyncErrors(async (req, res, next) => {
  try {
      // const admin = await User.findById(req.admin.id);
      // if (!admin) {
      //     return next(new ErrorHandler("Admin not found with this id", 400));
      // }
      
      const dealId = req.params.id;
      if (!mongoose.isValidObjectId(dealId)) {
          return next(new ErrorHandler("Id not valid", 400));
      }

      const flashDeal = await FlashdealModel.findById(dealId);
      if (!flashDeal) {
          return next(new ErrorHandler("No Deal found with this id", 400));
      }


      const { publish } = req.body;

      console.log("publish", publish)
   

      if (publish != null) {
          
        flashDeal.publish = publish;
      }

      await flashDeal.save();
      res.status(200).json({ success: true, flashDeal });
  } catch (error) {
      return next(new ErrorHandler(error, 500));
  }
}))

router.delete("/delete-flashDeal/:id", isAdmin, catchAsyncErrors(async(req,res,next)=>{
  try{
    const admin = await User.findById(req.admin.id) 
   
    if(!admin){
      return next(new ErrorHandler("Admin not found with this id", 400));
    }

    const flashDealId = req.params.id
    if (!mongoose.isValidObjectId(flashDealId)) {
      return next(new ErrorHandler("Id not valid", 400));
    }

    const flashDeal = await FlashdealModel.findById(flashDealId)

    if (!flashDeal) {
      return next(new ErrorHandler("No Deal found with this id", 400));
    }

    if (flashDeal?.image?.public_id) {
      await cloudinary.uploader.destroy(flashDeal?.image?.public_id);
    }

    await FlashdealModel.findByIdAndDelete(flashDealId)

     return res.status(201).json({
      success: true,
      message: "Flash deal deleted successfully!",
    });

  }
  catch(err){
    return next(new ErrorHandler(err, 500));
  }
}))

module.exports = router;