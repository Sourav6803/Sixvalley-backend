const Messages = require("../model/messages");
const Conversation = require("../model/conversation")
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const router = express.Router();
const file = require('../controller/aws');
const { upload } = require("../app");

const cloudinary = require('cloudinary').v2



router.post("/uploadFile",upload.single("image"), catchAsyncErrors(async (req, res, next) => {
  try {

    let uploadFile;
    if (req?.file) {
      const files = req.file
      
      if(files.mimetype === 'image/png' || files.mimetype === 'image/jpeg' || files.mimetype === 'image/jpg' || files.mimetype === 'image/gif' || files.mimetype === 'image/bmp' || files.mimetype === 'image/svg'){
        // uploadFile = await file.uploadFile(myFile)

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({folder: "message"}, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }).end(files.buffer);
        });

        uploadFile = result.secure_url

        return res.send(uploadFile)
      }else{
        return res.status(400).send({message: "Only JPEG, PNG, SVG, JPG and GIF images are allowed!"})
      }
      
    }
    
  } catch (error) {
    return next(new ErrorHandler(error.message), 500);
  }

}))


// create new message
router.post("/create-new-message", catchAsyncErrors(async (req, res, next) => {
  try {
    const newMessage = new Messages(req.body);
    await newMessage.save();
    await Conversation.findByIdAndUpdate(req.body.conversationId, { lastMessage: req.body.text }, { new: true });
    res.status(200).json({ newMessage, msg: "Message has been sent successfully" });

  } catch (error) {
    return next(new ErrorHandler(error.message), 500);
  }
})
);

// get all messages with conversation id
router.get("/get-all-messages/:id", catchAsyncErrors(async (req, res, next) => {
    try {
      const messages = await Messages.find({
        conversationId: req.params.id,
      });

      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })
);

module.exports = router;