const { RateLimiterMemory } = require('rate-limiter-flexible');
const User = require('../model/user');

const rateLimiter = new RateLimiterMemory({
    points: 1, // 1 request per day
    duration: 24 * 60 * 60 // per day
});

// const canRequestCoupon = async(userId) => {
//     try {
//         await rateLimiter.consume(userId);
//         const user = await User.findOne({ userId });
//         if (user && user.lastCouponRequestTime && new Date() - user.lastCouponRequestTime < 24 * 60 * 60 * 1000) {
//             return false;
//         }
//         return true;
//     } catch (err) {
//         return false;
//     }
// }

// module.exports = { canRequestCoupon };


const canRequestCoupon = async (userId) => {
    try {
        // Consume a point from the rate limiter
        await rateLimiter.consume(userId);

        // If successful, update user's last coupon request time
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { lastCouponRequestTime: new Date() } },
            { new: true }
        );

        // Return true, indicating the user can request a coupon
        return true;
    } catch (err) {
        // If the rate limit is exceeded, return false
        return false;
    }
};

module.exports = { canRequestCoupon };