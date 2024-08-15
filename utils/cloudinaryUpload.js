// This module will upload files to cloudinary.

const cloudinary = require('cloudinary').v2

// async function to upload files to cloudinary
exports.cloudinaryUploader = async (req, res) => {
    // extract the file from the request
    const file = req.file;

    console.log("file",file)

    // check if the file exists
    if (!file) {
        return res.status(400).json({ message: "File not found" });
    }
    //   else

    //   extract the original file name
    const fName = file.originalname.split(".")[0];
    console.log("f name", fName)

    //   upload the file to cloudinary server

    try {


        const uploadAudio = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw",
            public_id: `audioTutorial/${fName}`,
        });
        console.log(uploadAudio)
        return uploadAudio;
    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: error.message });
    }
};

