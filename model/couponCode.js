// const mongoose = require("mongoose");

// const coupounCodeSchema = new mongoose.Schema({
//     name:{
//         type: String,
//         required:[true,"Please enter your coupoun code name!"],
//         unique: true,
//     },
//     value:{
//         type: Number,
//         required: true,
//     },
//     minAmount:{
//         type: Number,
//     },
//     maxAmount:{
//         type: Number,
//     },
//     shopId:{
//      type: String,
//      required: true,
//     },
//     selectedProduct:{
//      type: String,
//     },
//     createdAt:{
//         type: Date,
//         default: Date.now(),
//     }
// });



const mongoose = require("mongoose");

const coupounCodeSchema = new mongoose.Schema({
    couponType:{
        type: String,
        enum: [
            "Discount on purchase", 
            "Free delivery", 
            "First Order",
            "Buy One Get One Free (BOGO)",
            "Percentage Off",
            "Amount Off",
            "Loyalty Reward",
            "Seasonal Discount",
            "Referral Discount",
            "Student Discount",
            "Bulk Purchase Discount",
            "Clearance Sale",
            "New Product Launch",
            "App-Exclusive",
            "Anniversary Sale"
        ]
    },
    couponTitle:{
        type: String,
        required: true,
    },
    couponCategory: {
        type: String,
    },
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: String,
    },
    limitForSameUser: {
        type: Number
    },
    discountType: {
        type: String,
        enum: ["Percent","Amount"]
    },

    discountAmount: {
        type: Number
    },

    minPurchase:{
        type: Number,
    },
    
    startDate: {
        type: Date
    },

    expireDate: {
        type: Date
    },

    // Array of user references who have used the coupon.
    usedByUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    shopId:{
     type: String,
     required: true,
    },

    sellerId: {
      type: String,
    },

    used: {
        type: Number,
        default: 0
    },
    reserved: {
        type: Boolean,
        default: false,
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    
    isActive: {
        type: Boolean,
        default: true
    },

    createdAt:{
        type: Date,
        default: Date.now(),
    }
});

coupounCodeSchema.index({ couponCode: 1 }, { unique: true });

module.exports = mongoose.model("CoupounCode", coupounCodeSchema);


// module.exports = mongoose.model("CoupounCode", coupounCodeSchema);