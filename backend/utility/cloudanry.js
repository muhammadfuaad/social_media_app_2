const cloudinary = require('cloudinary').v2;
const fs=require("fs")

cloudinary.config({ 
  cloud_name: 'drgiv97nz', 
  api_key: '346586748386385', 
  api_secret: 'QjuY_KEsI-P62KJR_nPcIGkNltQ' 
});

exports.uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    fs.unlinkSync(localFilePath); 
    return response.secure_url; 
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error); 
    fs.unlinkSync(localFilePath); 
    throw new Error('Error uploading to Cloudinary');
  }
};
