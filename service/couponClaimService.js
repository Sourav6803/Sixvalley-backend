const Coupon = require('../model/couponCode');
const User = require('../model/user');
const { redis } = require("../redis")
const { canRequestCoupon } = require('./rateLimiterService');

// // const redisClient = redis.createClient();
// const COUPON_EXPIRY_TIME = 300; // 5 minutes

// const claimCoupon = async (userId, couponCode) => {

//     const user = await User.findById(userId)
//     if(!user){
//         throw new Error('User not exist'); 
//     }
//     const coupon = await Coupon.findOne({couponCode });

//     if (!coupon) {
//       throw new Error('Invalid coupon code');
//     }


//     // if (!await canRequestCoupon(userId)) {
//     //     throw new Error('Rate limit exceeded');
//     // }

//     // Check if coupon is restricted to first-time orders
//     // if (Coupon.limitForSameUser && User.firstOrder) {
//     //     throw new Error('Coupon is only applicable for first-time orders');
//     // }

//     if (user.usedCoupons && user.usedCoupons.includes(couponCode)) {
//         throw new Error('Coupon has already been used by this user');
//     }

//     const availableCoupon = await Coupon.findOneAndUpdate({ status: 'not-used' }, { status: 'used' }, { new: true });
//     if (!availableCoupon) {
//         throw new Error('No available coupons');
//     }

//     // redis.setex(userId, COUPON_EXPIRY_TIME, availableCoupon.couponCode);

//     await user.updateOne({ _id:userId }, { $set: { lastCouponRequestTime: new Date(), } }, { upsert: true });

//     user.usedCoupons.push(couponCode);
//     user.firstOrder = true;
//     coupon.usedByUsers.push(userId);
//     coupon.count = (coupon.count || 0) + 1;

//     user.save()
//     coupon.save()

//     return availableCoupon;
// }

// module.exports = { claimCoupon };




const claimCoupon = async (userId, couponCode) => {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User does not exist');
    }

    // Find the coupon
    const currentDate = new Date();
    const coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        reserved: false, // Ensure the coupon is not already reserved
        startDate: { $lte: new Date() },
        expireDate: { $gte: new Date() },
      });

    if (!coupon) {
        throw new Error('Coupon is either expired, inactive, or already used');
    }

    // Check if coupon is restricted to first-time orders
    if (Coupon.limitForSameUser && user.firstOrder) {
        throw new Error('Coupon is only applicable for first-time orders');
    }

    // Check if coupon was already used by this user
    if (coupon.usedByUsers && coupon.usedByUsers.includes(userId)) {
        throw new Error('You have alredy used this Coupon');
    }

    // Atomically update the coupon's usage status
    // const updatedCoupon = await Coupon.findOneAndUpdate(
    //     { _id: coupon._id, status: 'not-used' }, // Ensure it is still not used
    //     { $push: { usedByUsers: userId }, $inc: { used: 1 } }, // Update status and usage
    //     { new: true } // Return the updated document
    // );

    // if (!updatedCoupon) {
    //     throw new Error('Coupon has already been used or does not exist');
    // }

    // Update user data
    // user.usedCoupons = user.usedCoupons || [];
    // user.usedCoupons.push(couponCode);
    // user.firstOrder = true; // Set this if it's a first order
    // user.lastCouponRequestTime = new Date();

    // await user.save();

    coupon.reserved = true;
    coupon.reservedBy = userId;
    await coupon.save();

    return coupon;
};


const validCoupon = async (userId, couponCode) => {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User does not exist');
    }

    console.log("couponCode",couponCode)
    // Find the coupon
    const coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        // reserved: false, // Ensure the coupon is not already reserved
        startDate: { $lte: new Date() },
        expireDate: { $gte: new Date() },
      });

    if (!coupon) {
        throw new Error('Coupon is either expired, inactive, or already used');
    }

    // Check if coupon is restricted to first-time orders
    // if (Coupon.limitForSameUser && user.firstOrder) {
    //     throw new Error('Coupon is only applicable for first-time orders');
    // }

    // Check if coupon was already used by this user
    if (coupon.usedByUsers && coupon.usedByUsers.includes(userId)) {
        throw new Error('You have alredy used this Coupon');
    }

    

    coupon.reserved = true;
    coupon.reservedBy = userId;
    await coupon.save();

    return coupon;
};
module.exports = { claimCoupon, validCoupon };