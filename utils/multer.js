// import multer middleware
const multer = require( "multer");

// configure multer disk storage for dile uploads
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    let fileExt = file.originalname.split(".").pop();

    // generate new file name
    const fileName = `${new Date().getTime()}.${fileExt}`;

    // callback to use the new file name when storing the uploaded

    cb(null, fileName);
  },
});

// set up file filters for multer

const fileFilter = (req, file, cb) => {
  // check for file type and return response
  if (file.mimetype !== "audio/mpeg" && file.mimetype !== "audio/mp3") {
    req.fileValidationError = "File type must be audio/mp3 or audio/mpeg";

    // returning the file validation error in the req object
    return cb(null, false, req.fileValidationError);
  } else {
    // else when the file type is okay, move forward to the next action
    cb(null, true);
  }
};

//configure multer with specified functions above

 exports.upload = multer({
  storage,
  fileFilter,
}).single("audio");

// The audio can be any name, audio is the file name to use when uploading

// export the multer upload

// module.exports = upload;