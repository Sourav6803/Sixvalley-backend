


const mongoose = require("mongoose");

const featureDealSchema = new mongoose.Schema({
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

    publish: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    }
},{timestamps: true});


module.exports = mongoose.model("FeatureDeal", featureDealSchema);


// module.exports = mongoose.model("CoupounCode", coupounCodeSchema);