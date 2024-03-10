/* eslint-disable no-console */
import { v2 as cloudinary, v2 } from 'cloudinary';
import fs from 'fs';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function(localFilePath){
    try {
        if(!localFilePath) {
            return null;
        }

        const response = await v2.uploader.upload(localFilePath, {
            resource_type: 'auto',
            folder: 'youtube', // Save files in a folder named lms
            width: 250,
            height: 250,
            gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
            crop: 'fill'
        });

        console.log('file uploaded on cloudinary', response);

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log('something went wrong while uploading on cloudinary',error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export default uploadOnCloudinary;