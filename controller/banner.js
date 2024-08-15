const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated, isSeller } = require("../middleware/auth");
const router = express.Router();
const User = require("../model/user")
const { upload } = require("../app")
const mongoose = require('mongoose')
const BannerModel = require("../model/banner.js");
const cloudinary = require("cloudinary").v2;


router.post("/create-banner", isSeller, isAdmin, upload.single('bannerImg'), catchAsyncErrors(async (req, res, next) => {
    try {

        const admin = await User.findById(req.admin.id);
        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const { bannerType, resourceType, resourceValue } = req.body;

        // Check if user is authenticated
         const sellerId = req.seller.id

        const bannerImg = req.file;

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: "banner" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(bannerImg.buffer);

        });

        const banner = {
            bannerType: bannerType,
            resourceType: resourceType,
            resourceValue: resourceValue,
            bannerImg: {
                public_id: result.public_id,
                url: result.secure_url
            },
            sellerId: sellerId
        }

        const data = await BannerModel.create(banner);

        res.status(201).json({
            success: true,
            message: "Banner created",
            data,
        });

    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))


router.get("/get-banner/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // const admin = await User.findById(req.admin.id)

        // if (!admin) {
        //   return next(new ErrorHandler("Admin not found with this id", 400));
        // }



        const bannerId = req.params.id

        if (!mongoose.isValidObjectId(bannerId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const banner = await BannerModel.findById(bannerId)



        if (!banner) {
            return next(new ErrorHandler("No banner found with this id", 400));
        }

        return res.status(200).json({ message: "Banner Fetched Succesfully!", banner })
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))


router.get("/get-all-banner", catchAsyncErrors(async (req, res, next) => {
    try {

        // const admin = await User.findById(req.admin.id) 

        // if(!admin){
        //   return next(new ErrorHandler("Admin not found with this id", 400));
        // }

        const data = await BannerModel.find()

        res.status(200).json({
            success: true,
            message: "Banner fetched succesfully!",
            data,
        });
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))


router.put("/update-banner/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // const admin = await User.findById(req.admin.id);
        // if (!admin) {
        //     return next(new ErrorHandler("Admin not found with this id", 400));
        // }

        const bannerId = req.params.id;
        if (!mongoose.isValidObjectId(bannerId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const banner = await BannerModel.findById(bannerId);
        if (!banner) {
            return next(new ErrorHandler("No Banner found with this id", 400));
        }


        const { bannerType } = req.body;

        if (bannerType != null) {
            const existName = await BannerModel.findOne({ bannerType });
            if (existName && existName._id.toString() !== bannerId) {
                return next(new ErrorHandler("Already a banner exists with this type", 400));
            }
            banner.bannerType = bannerType;
        }

        await banner.save();
        res.status(200).json({ success: true, banner });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}))

router.put("/update-banner-status/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // const admin = await User.findById(req.admin.id);
        // if (!admin) {
        //     return next(new ErrorHandler("Admin not found with this id", 400));
        // }

        const bannerId = req.params.id;
        if (!mongoose.isValidObjectId(bannerId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const banner = await BannerModel.findById(bannerId);
        if (!banner) {
            return next(new ErrorHandler("No Banner found with this id", 400));
        }


        const { isPublished } = req.body;


        if (isPublished != null) {

            banner.isPublished = isPublished;
        }

        await banner.save();
        res.status(200).json({ success: true, banner });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}))


router.delete("/delete-banner/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // const admin = await User.findById(req.admin.id)

        // if (!admin) {
        //     return next(new ErrorHandler("Admin not found with this id", 400));
        // }

        const bannerId = req.params.id
        if (!mongoose.isValidObjectId(bannerId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const banner = await BannerModel.findById(bannerId)

        if (!banner) {
            return next(new ErrorHandler("No Banner found with this id", 400));
        }

        await BannerModel.findByIdAndDelete(bannerId)

        return res.status(201).json({
            success: true,
            message: "Banner deleted successfully!",
        });

    }
    catch (err) {
        return next(new ErrorHandler(err, 500));
    }
}))

module.exports = router;