import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successful
        // console.log("file is successful uploaded", response.url)
        fs.unlinkSync(localFilePath)
        return response;


    }   catch(error) {
        console.error('Error uploading file to Cloudinary:', error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Delete the temporary file if it exists
        }
        return null;

    }
}

export  { uploadOnCloudinary };



