const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();

const User = require("../model/user")

const mongoose = require('mongoose')
const FlashdealModel = require("../model/flashDeal")
const DealOfTheday = require("../model/dealOfTheDay")
const { redis } = require("../redis")


router.post("/create-dealOfTheDay", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {

        const isDealExist = await FlashdealModel.find({
            name: req.body.name,
        });

        if (isDealExist.length !== 0) {
            return next(new ErrorHandler("Deal already exists!", 400));
        }


        const deal = {
            name: req.body.name,
            products: req.body.products,

        }

        const data = await DealOfTheday.create(deal);

        res.status(201).json({
            success: true,
            message: "Deal Of the created",
            data,
        });
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.get("/get-dealOfTheDay/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id)

        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const flashDealId = req.params.id

        if (!mongoose.isValidObjectId(flashDealId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const flashDeal = await DealOfTheday.findById(flashDealId)

        if (!flashDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }

        return res.status(200).json({ message: "deal Of the day Fetched Succesfully!", flashDeal })
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.get("/get-all-dealOfTheday", catchAsyncErrors(async (req, res, next) => {
    try {

        // const cachedDeals = await redis.get('activeDeals');

        // if (cachedDeals) {
        //     console.log("from cache deals of the day")
        //     const activeDeals = JSON.parse( cachedDeals)
        //     console.log(activeDeals)
        //     return res.json(activeDeals);
        // }

        

        const activeDeals = await DealOfTheday.find().populate('products');


        await redis.set('activeDeals', JSON.stringify(activeDeals ), 'EX', 60 * 60); // Cache for 1 hour

        res.status(200).json({
            success: true,
            message: "Flash fetched succesfully!",
           activeDeals,
        });
    }
    catch (error) {
        return next(new ErrorHandler(error, 400));
    }
}))

router.put("/update-dealOfTheDay/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id);
        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const dealId = req.params.id;
        if (!mongoose.isValidObjectId(dealId)) {
            return next(new ErrorHandler("Invalid ID", 400));
        }

        const flashDeal = await DealOfTheday.findById(dealId);
        if (!flashDeal) {
            return next(new ErrorHandler("No  deal of the day found with this id", 404));
        }


        const { name, startDate, expireDate, products } = req.body;

        if (name) {
            const existingDeal = await DealOfTheday.findOne({ name });
            if (existingDeal && existingDeal._id.toString() !== dealId) {
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



        await flashDeal.save();
        redis.set('activeDeals', JSON.stringify(flashDeal), 'EX', 60 * 60)
        res.status(200).json({ success: true, flashDeal });
    } catch (error) {
        return next(new ErrorHandler(error.message || "An error occurred while updating the deal of the day", 500));
    }
}));

router.put("/update-dealOfTheDay-publicStatus/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // const admin = await User.findById(req.admin.id);
        // if (!admin) {
        //     return next(new ErrorHandler("Admin not found with this id", 400));
        // }

        const dealId = req.params.id;
        if (!mongoose.isValidObjectId(dealId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const flashDeal = await DealOfTheday.findById(dealId);
        if (!flashDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }

        const { status } = req.body;

        if (status != null) {

            flashDeal.status = status;
        }

        await flashDeal.save();
        res.status(200).json({ success: true, flashDeal });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}))

router.delete("/delete-dealOfTheDay/:id", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await User.findById(req.admin.id)

        if (!admin) {
            return next(new ErrorHandler("Admin not found with this id", 400));
        }

        const flashDealId = req.params.id
        if (!mongoose.isValidObjectId(flashDealId)) {
            return next(new ErrorHandler("Id not valid", 400));
        }

        const flashDeal = await DealOfTheday.findById(flashDealId)

        if (!flashDeal) {
            return next(new ErrorHandler("No Deal found with this id", 400));
        }



        await DealOfTheday.findByIdAndDelete(flashDealId)

        return res.status(201).json({
            success: true,
            message: "Deal of the day deleted successfully!",
        });

    }
    catch (err) {
        return next(new ErrorHandler(err, 500));
    }
}))

// cron.schedule('*/5 * * * *', async () => { // Runs every 5 minutes
//     const now = new Date();

//     const dealsToActivate = await Deal.updateMany(
//         { startDate: { $lte: now }, endDate: { $gt: now }, isActive: false },
//         { isActive: true }
//     );

//     if (dealsToActivate.modifiedCount > 0) {
//         const activeDeals = await Deal.find({ isActive: true }).populate('products');
//         await redisClient.set('activeDeals', JSON.stringify(activeDeals), 'EX', 60 * 60);
//     }
// });

// // Task to deactivate deals
// cron.schedule('*/5 * * * *', async () => {
//     const now = new Date();

//     const dealsToDeactivate = await DealOfTheday.updateMany(
//         { endDate: { $lte: now }, isActive: true },
//         { isActive: false }
//     );

//     if (dealsToDeactivate.modifiedCount > 0) {
//         const activeDeals = await DealOfTheday.find({ isActive: true }).populate('products');
//         await redisClient.set('activeDeals', JSON.stringify(activeDeals), 'EX', 60 * 60);
//     }
// });

module.exports = router;