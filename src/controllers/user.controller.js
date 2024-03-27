import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/fileUpload.cloudniary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
     try{
          const user = await User.findById(userId)
          if(!user){
               throw new ApiError(404, "user not found")
          }
          const accessToken = user.generateAccessToken()
          console.log("acessToken: ",accessToken)
          const refreshToken = user.generateRefreshToken()
          console.log("refershToken: ",refreshToken)


          const userRefreshToken = user.refreshToken = refreshToken
          console.log("user.refreshToken", userRefreshToken)
          const savechanges = await user.save( {validateBeforeSave:false })
          console.log("saving changes ",savechanges)

          return { accessToken, refreshToken }

     }catch(error){
          throw new ApiError(500, "something went wrong while generating refresh and access token")
     }
}

const registerUser = asyncHandler(async (req, res) => {
    // Assuming you want to extract these details from the request body
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


     //check if the fields are non-empty 
     if(
          [username, email, fullname, password].some((field) =>
          field?.trim() === "")
     ) {
          throw new ApiError(400, "All fields are required")
     }
     //check users is already exists
      const exisedUser = await User.findOne({
          $or:[{ username }, { email }]
     })
     console.log(exisedUser)


     //if exists throw error
     if (exisedUser) {
          throw new ApiError(409,"User with email is already exists")
     }
     // console.log(req.files)

     // getting images fromm users and make it save in local server then to cluodinary
     const avatarLocalPath = req.files?.avatar[0]?.path;
     // const CoverImageLocalPath = req.files?.coverImage[0]?.path;

     let CoverImageLocalPath;

     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
          CoverImageLocalPath = req.files.coverImage[0].path
     }


     //validate if the images are uploaded or not in the cloudinary
     if(!avatarLocalPath){
          throw new ApiError(400, "Avatar file is required ")
     }


     //upload images to cloudinary
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(CoverImageLocalPath)

      //validate for avatar is must 
     if(!avatar) {
          throw new ApiError(400, "Avatar file is required ")
     }

   
     const user = await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username: username.toLowerCase()
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

const loginUser = asyncHandler(async (req,res) => {
     //req body -> data
     //username or email 
     //find user
     //password check
     //access and refresh token 
     //send with cookies
     
     
     const {email, username, password} = req.body

     if(!(username || email)) {
          throw new ApiError(400, "username or password is required")    
     }

     const user = await User.findOne({
          $or: [{username}, {email}]
     })

     if(!user){
           throw new ApiError(404, "username is not found")
     }

     const isPasswordVaild = await user.isPasswordCorrect(password)

     if(!isPasswordVaild){
          throw new ApiError(401, "Invaild user credentials")
     }

     console.log(user._id)
     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
     const loddedInUser = await User.findById(user._id).
     select("-password  -refreshToken")


     const options = {
          httpOnly:true,
          secure:true
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json({
       data: {
         user: loddedInUser,
         accessToken: accessToken,
         refreshToken: refreshToken
       },
       message: "User logged in successfully"
     })

   
})

const logoutUser = asyncHandler(async (req,res) => {
         await User.findByIdAndUpdate(
               req.user._id,
               {
                   $set:{
                      refreshToken:undefined
                   } 
               },
               {
                    new:true
               }
          )

          const options = {
               httpOnly:true,
               secure:true
          }
     
          return res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(new ApiResponse(200),{},"user logged out successfullly")
     

})


const refershAccessToken = asyncHandler(async (req,res) =>{
     const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

     if(!incomingRefreshToken) {
          throw new ApiError(401, "unauthorized Request")
     }

    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
      const user = await User.findById(decodedToken?._id)
 
      if(!user){
           throw new ApiError(401, "Invalid refresh token")
      }
 
      if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError(401, "refresh token is expired or used")
 
      }
 
      const options = {
           httpOnly:true,
           secure:true
      }
      const {accessToken, newrefreshToken} =  await generateAccessAndRefreshTokens(user._id)
 
      return res
      .status(200)
      .cookie("accessToken", accessToken,options)
      .cookie("refreshToken", newrefreshToken,options)
      .json(
           new ApiResponse(
                200,
                {accessToken, refreshToken:newrefreshToken},
                "access token refreshed"
           )
      )
    } catch (error) {
          throw ApiError(401,error?.message ||
               "invalid refresh token")
    }
})

// Login Flow:
// [Client] --> [Server] : Send login credentials (username/email, password)
// [Server] --> [Database] : Query user based on username/email
// [Database] --> [Server] : Retrieve user data
// [Server] --> [Client] : Send access and refresh tokens as cookies
// [Client] --> [Server] : Include access and refresh tokens in subsequent requests

// Logout Flow:
// [Client] --> [Server] : Send logout request
// [Server] --> [Database] : Update user document to remove refresh token
// [Server] --> [Client] : Clear access and refresh tokens from cookies

export { 
     registerUser, 
     loginUser,
     logoutUser,
     refershAccessToken
};


