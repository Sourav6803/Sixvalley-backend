const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  // price: {
  //   type: Number,
  //   required: true,
  //   min: 0
  // },

  originalPrice: {
    type: Number,
  },
  discountType: {
    type: String,
    enum: ["Flat", "Percent",],
    default: "Flat"
  },
  discountAmount: {
    type: Number,

  },
  afterDiscountPrice: {
    type: Number,
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  sold_out: {
    type: Number,
    default: 0,
  },

  attributes: [
    {
      key: {
        type: String,
        trim: true,
        maxlength: 50
      },
      value: {
        type: String,
        trim: true,
        maxlength: 50
      },
      _id: false
    }
  ],


  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      _id: false
    }],



});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },
  subCategory: {
    type: String,
    // required: [true, "Please enter your product Sub category!"],
  },
  subSubcategory: {
    type: String,
  },
  brand: {
    type: String,
  },
  keyPoints: {
    type: String,
  },
  productType: {
    type: String,
    enum: ["Physical", "Digital",],
    default: "Physical"
  },
  sku: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    // enum: ["kg","gm", "pc", "inch","m","cm", "ltrs", "pairs"]
  },
  tags: {
    type: String,
  },
  customize: {
    type: String,
    // default: false
  },

  otherDetails: {
    type: mongoose.Schema.Types.Mixed,
  },

  variants: [variantSchema],

  originalPrice: {
    type: Number,
  },
  dicountType: {
    type: String,
    enum: ["Flat", "Percent",],
    default: "Flat"
  },
  discountAmount: {
    type: Number,

  },
  afterDiscountPrice: {
    type: Number,
  },

  // discountAmount: {
  //   type: Number,
  //   default: 0
  // },
  shippingCost: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },

  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      _id: false
    },


  ],
  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      }
    },
  ],
  ratings: {
    type: Number,
  },
  shopId: {
    type: String,
    // required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  approved: {
    type: Boolean,
    default: true
  },
  productSource: {
    type: String,
    enum: ["Admin", "Seller"],
    required: true,
    default: "Admin",
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);
