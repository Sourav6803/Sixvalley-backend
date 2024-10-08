const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const subcriptionScheema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ["basic", 'premium'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false })

const shopSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please enter vendor name!"],
  },
  name: {
    type: String,
    required: [true, "Please enter shop name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
  },
  description: {
    type: String,
  },
  //   addresses:[
  //     {
  //       country: {
  //         type: String,
  //       },
  //       city:{
  //         type: String,
  //       },
  //       address1:{
  //         type: String,
  //       },
  //       address2:{
  //         type: String,
  //       },
  //       zipCode:{
  //         type: Number,
  //       },
  //       addressType:{
  //         type: String,
  //       },
  //     }
  //   ],
  address: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "seller",
  },
  avatar: {
    public_id: {
      type: String,

    },
    url: {
      type: String,

    },

  },

  zipCode: {
    type: Number,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  // subcription: subcriptionScheema,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

//  Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};




module.exports = mongoose.model("Shop", shopSchema);