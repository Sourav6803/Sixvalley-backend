const {Redis} = require("ioredis") 

require("dotenv").config()


const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log(`Redis connected`)
        return  process.env.REDIS_URL 
    }
    throw new Error('Redis connection Failed')
}
exports.redis = new Redis(redisClient())