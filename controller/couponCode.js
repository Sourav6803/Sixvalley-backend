const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAdmin } = require("../middleware/auth");
const CoupounCode = require("../model/couponCode");
const { claimCoupon, validCoupon } = require("../service/couponClaimService");
const router = express.Router();

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller || isAdmin,
  catchAsyncErrors(async (req, res, next) => {
    try {

      const data = req.body
      const { couponType,
        couponTitle,
        couponCategory,
        couponCode,
        limitForSameUser,
        customer,
        discountType,
        discountAmount,
        minPurchase,
        startDate,
        expireDate,
        shopId,
        sellerId } = data

      const isCoupounCodeExists = await CoupounCode.find({
        couponTitle: couponTitle,
      });

      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(data);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get coupon code value by its name
router.get(
  "/get-coupon-value/:couponTitle",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ couponTitle: req.params.couponTitle });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get('/active', async (req, res) => {
  try {
    const today = new Date();
    const coupons = await CoupounCode.find({
      isActive: true,
      expireDate: { $gte: today } // Greater than or equal to today
    });

    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/availabe-coupon', async (req, res) => {
  const {  id:userId, couponCode } = req.body;
  // Ensure userId and couponCode are provided
  if (!userId || !couponCode) {
    return res.status(400).json({ error: 'User ID and coupon code are required' });
  }

  try {
    const coupon = await validCoupon(userId, couponCode);
    res.status(200).json({
      success: true,
      message: "Coupon applied and reserved successfully",
      coupon,
    });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});



module.exports = router;