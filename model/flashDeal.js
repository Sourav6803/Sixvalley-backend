


const mongoose = require("mongoose");

const flashDealSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    startDate: {
        type: Date
    },

    expireDate: {
        type: Date
    },

    status: {
        type: String,
        enum: ['Active', 'Expired'],
        default: 'Active'
    },

    products: [],

    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
        _id: false

    },
    publish: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    }
},{timestamps: true});


module.exports = mongoose.model("FlashDeal", flashDealSchema);


// module.exports = mongoose.model("CoupounCode", coupounCodeSchema);