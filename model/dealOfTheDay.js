
const mongoose = require("mongoose");

const dealOfTheDay = new mongoose.Schema({
    name: {
        type: String,
    },

    status: {
        type: Boolean,
        default: true
    },

    products:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    createdAt: {
        type: Date,
        default: Date.now(),
    }
},{timestamps: true});


module.exports = mongoose.model("DealOfTheDay", dealOfTheDay);


// module.exports = mongoose.model("CoupounCode", coupounCodeSchema);
// type: mongoose.Schema.Types.ObjectId, ref: 'Product'