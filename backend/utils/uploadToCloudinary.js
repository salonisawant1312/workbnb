const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadToCloudinary = async (file, folder) => {
  if (!file) return null;
  if (!isCloudinaryConfigured()) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder
  });
  return result.secure_url;
};

module.exports = uploadToCloudinary;
