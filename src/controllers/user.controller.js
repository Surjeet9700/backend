import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/fileUpload.cloudniary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // Assuming you want to extract these details from the request body
//   

    // Here you would add your logic for:
    // 0. get user details from the frontend 
    // 1. Validating the input (not empty, valid email format, etc.)
    // 2. Checking if the user already exists based on email or username
    // 3. Handling image and avatar uploads (e.g., using Cloudinary)
    // 4. Creating the user object and saving it to the database
    // 5. Removing sensitive fields like password and refreshToken from the response object
    // 6. Checking if the user was successfully created and handling any errors
    // 7. Returning a success response
     const { username, email, fullname, password } = req.body;
     console.log("email:", email);
     console.log("password:", password);


     //check if the fields are non-empty 
     if(
          [username, email, fullname, password].some((field) =>
          field?.trim() === "")
     ){
          throw new ApiError(400, "All fields are required")
     }
     //check users is already exists
      const exisedUser = User.findOne({
          $or:[{ username }, { email }]
     })


     //if exists throw error
     if(exisedUser){
          throw new ApiError(409,"User with email is already exists")
     }

     // getting images fromm users and make it save in local server then to cluodinary
     const avatarLocalPath = req.files?.avatar[0]?.path
     const CoverImageLocalPath = req.files?.coverImage[0]?.path

     //validate for avatar is must 
     if(!avatarLocalPath){
          throw new ApiError(400, "avatar is required ")
     }

     //upload images to cloudinary
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(CoverImageLocalPath)

     //validate if the images are uploaded or not in the cloudinary
     if(!avatar){
          throw new ApiError(400, "avatar is required ")

     }

      const user = await User.create({
          fullname,
          avatar:avatar.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username: username.tolowercase()
     })

      const createdUser = await User.findById(user._id).select(
          "-password -refreshToken"
      )
     
      if(!createdUser){
          throw new ApiError(500, "something went wrong while registering the user")
      }

      return res.status(201).json(
          new ApiResponse(200, createdUser, "user register successfully")
      )
});

export { 
     registerUser, 
};
