
const express = require('express')
const path = require("path")
const User = require("../model/user")
const router = express.Router()
const { upload } = require("../app")
const ErrorHandler = require('../utils/ErrorHandler')
const jwt = require("jsonwebtoken")
const sendMail = require('../utils/sendMail')
const catchAsyncError = require("../middleware/catchAsyncErrors")
const adminToken = require("../utils/adminToken")
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { isAuthenticated, isAdmin, isSeller } = require('../middleware/auth')

const cloudinary = require("cloudinary").v2;
const ejs = require( "ejs");
const sendAdminToken = require('../utils/adminToken')


// login shop
router.post(
    "/login-admin",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return next(new ErrorHandler("Please provide the all fields!", 400));
        }
  
        const user = await User.findOne({ email }).select("+password");
  
        if (!user) {
          return next(new ErrorHandler("User doesn't exists!", 400));
        }
  
        const isPasswordValid = await user.comparePassword(password);
  
        if (!isPasswordValid) {
          return next(
            new ErrorHandler("Please provide the correct information", 400)
          );
        }
  
        sendAdminToken(user, 201, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );


  router.get("/getAdmin", isAdmin, catchAsyncErrors(async (req, res, next) => {
    try {
      const admin = await User.findById(req.admin.id);
  
      if (!admin) {
        return next(new ErrorHandler("Admin doesn't exists", 400));
      }
  
      res.status(200).json({
        success: true,
        admin,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
  );

  module.exports = router;