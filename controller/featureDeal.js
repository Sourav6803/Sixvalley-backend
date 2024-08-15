const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, } = require("../middleware/auth");
const router = express.Router();
const User = require("../model/user")
const mongoose = require('mongoose')
const { redis } = require("../redis")

const FeatureDealModel = require("../model/featureDeal");


router.post("/create-featureDeal", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {

        const { name, startDate, expireDate, products } = req.body;
        const isDealExist = await FeatureDealModel.findOne({
            name: name,
        });

        

        if (isDealExist !== null) {
            return next(new ErrorHandler("Deal already exists!", 400));
        }


        const featureDeal = {
            name: req.body.name,
            startDate: req.body.startDate,
            expireDate: req.body.expireDate,
            products: req.body.products,
        }

        const data = await FeatureDealModel.create(featureDeal);

        // Invalidate the cache for all deals
        await redis.del("all_feature_deals");

        res.status(201).json({
            success: true,
            message: "Feature deal created",
            data,
        });
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.get("/get-featureDeal/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        const featureDealId = req.params.id

        if (!mongoose.isValidObjectId(featureDealId)) {
            return next(new ErrorHandler("Id not valid", 400));


        }

        const cachedDeal = await redis.get(`feature_deal_${featureDealId}`);
        if (cachedDeal) {
            return res.status(200).json({ success: true, featureDeal: JSON.parse(cachedDeal) });
        }

        const featureDeal = await FeatureDealModel.findById(featureDealId)

        if (!featureDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }

        // Cache the deal
        await redis.setex(`feature_deal_${featureDealId}`, 3600, JSON.stringify(featureDeal));

        return res.status(200).json({ message: "Feature deal Fetched Succesfully!", featureDeal })
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.get("/get-all-featureDeal", catchAsyncErrors(async (req, res, next) => {
    try {

        // Check if the deals are cached
        const cachedDeals = await redis.get("all_feature_deals");
        if (cachedDeals) {
            console.log("from cache")
            return res.status(200).json({
                success: true,
                message: "Feature deals fetched successfully!",
                data: JSON.parse(cachedDeals)
            });
        }

        const data = await FeatureDealModel.find();

        // Cache the deals
        await redis.setex("all_feature_deals", 3600, JSON.stringify(data));

        res.status(200).json({
            success: true,
            message: "Featuredeal fetched succesfully!",
            data,
        });
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.put("/update-featureDeal/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id);
        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const featureDealId = req.params.id;
        if (!mongoose.isValidObjectId(featureDealId)) {
            return next(new ErrorHandler("Invalid ID", 400));
        }

        const featureDeal = await FeatureDealModel.findById(featureDealId);
        if (!featureDeal) {
            return next(new ErrorHandler("No  deal found with this id", 404));
        }


        const { name, startDate, expireDate, products } = req.body;

        if (name) {
            const existingDeal = await FeatureDealModel.findOne({ name });
            if (existingDeal && existingDeal._id.toString() !== featureDealId) {
                return next(new ErrorHandler("A deal with this name already exists", 400));
            }
            featureDeal.name = name;
        }

        if (startDate) {
            if (isNaN(Date.parse(startDate))) {
                return next(new ErrorHandler("Invalid start date", 400));
            }
            featureDeal.startDate = startDate;
        }

        if (expireDate) {
            if (isNaN(Date.parse(expireDate))) {
                return next(new ErrorHandler("Invalid expire date", 400));
            }
            featureDeal.expireDate = expireDate;
        }

        if (products) {
            featureDeal.products = products;
        }

        await featureDeal.save();

        // Invalidate the cache for this deal and all deals
        await redis.del(`feature_deal_${featureDealId}`);
        await redis.del("all_feature_deals");

        res.status(200).json({ success: true, featureDeal });
    } catch (error) {
        return next(new ErrorHandler(error.message || "An error occurred while updating the feature deal", 500));
    }
}));

router.put("/remove-product/:featureDealId/:productId", catchAsyncErrors(async (req, res, next) => {
    const { featureDealId, productId } = req.params;

    try {
        // Validate feature deal ID
        if (!mongoose.isValidObjectId(featureDealId)) {
            return next(new ErrorHandler("Invalid feature deal ID", 400));
        }

        // Validate product ID
        if (!mongoose.isValidObjectId(productId)) {
            return next(new ErrorHandler("Invalid product ID", 400));
        }

        // Fetch feature deal
        const featureDeal = await FeatureDealModel.findById(featureDealId);
        if (!featureDeal) {
            return next(new ErrorHandler("No deal found with this ID", 404));
        }

        // Check if product exists in the feature deal
        const productExists = featureDeal.products.some(prod => prod._id.toString() === productId);

        if (!productExists) {
            return next(new ErrorHandler("Product not found in this feature deal", 404));
        }

        // Remove product from the feature deal
        featureDeal.products = featureDeal.products.filter(prod => prod._id.toString() !== productId);
        // 

        // Save the updated feature deal
        await featureDeal.save();

        // Invalidate the cache for this deal
        await redis.del(`feature_deal_${featureDealId}`);

        res.status(200).json({ success: true, message: "Product removed from feature deal", featureDeal });
    } catch (error) {
        return next(new ErrorHandler(error.message || "An error occurred while removing the product from the feature deal", 500));
    }
}));


router.put("/update-featureDeal-publicStatus/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id);
        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const dealId = req.params.id;
        if (!mongoose.isValidObjectId(dealId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const featureDeal = await FeatureDealModel.findById(dealId);
        if (!featureDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }

        const { publish } = req.body;

        if (publish != null) {
            featureDeal.publish = publish;
        }

        await featureDeal.save();

        // Invalidate the cache for this deal
        await redis.del(`feature_deal_${dealId}`);

        // Update the cached list of all deals
        const cachedDeals = await redis.get("all_feature_deals");
        if (cachedDeals) {
            const deals = JSON.parse(cachedDeals);

            // Update the specific deal in the list
            const updatedDeals = deals.map(deal => 
                deal._id === dealId ? featureDeal : deal
            );

            // Set the updated list back into cache
            await redis.setex("all_feature_deals", 3600, JSON.stringify(updatedDeals));
        }

        res.status(200).json({ success: true, featureDeal });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}))

router.delete("/delete-featureDeal/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id)

        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const featureDealId = req.params.id
        if (!mongoose.isValidObjectId(featureDealId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const featureDeal = await FeatureDealModel.findById(featureDealId)

        if (!featureDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }


        await FeatureDealModel.findByIdAndDelete(featureDealId)

        await redis.del(`feature_deal_${featureDealId}`);
        await redis.del("all_feature_deals");

        return res.status(201).json({
            success: true,
            message: "Feature deal deleted successfully!",
        });

    }
    catch (err) {
        return next(new ErrorHandler(err, 500));
    }
}))

module.exports = router;