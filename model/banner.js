const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        bannerType: {
            type: String,
            enum: ["Main Banner", "Popup Banner", "Footer Banner", "Main Section Banner"]
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller',
            required: false,  // Make this field optional
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },

        bannerImg: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
            _id: false,
        },
        resourceType: {
            type: String,
            enum: ["Product", "Category", "Shop", "Brand"]
        },

        resourceValue: {
            type: String,
        },
        isPublished: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
