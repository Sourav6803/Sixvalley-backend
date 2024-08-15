const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
        },
        brandLogo: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
            _id: false,
        },
        category: {
            type: String,
        },
        totalProduct: {
            type: Number,
            default: 0
        },
        totalOrder: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
