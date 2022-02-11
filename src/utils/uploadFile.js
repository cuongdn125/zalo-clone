const { cloudinary } = require("../config/cloudinary");
const uploadImage = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      upload_preset: "uif5fsxt",
    });
    // console.log(uploadResponse.url);
    return uploadResponse.url;
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports = { uploadImage };
