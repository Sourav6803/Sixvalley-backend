const redis = require('redis');
const Coupon = require('../model/couponCode');

const redisClient = redis.createClient();

const trackUsage = async(userId)=> {
    redisClient.get(userId, async (err, couponCode) => {
        if (couponCode) {
            await Coupon.updateOne({ couponCode }, { status: 'not-used' });
            redisClient.del(userId);
        }
    });
}

module.exports = { trackUsage };
