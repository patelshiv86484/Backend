import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens=async (user)=>{ 

    try {  
      const accessToken =user.generateAccessToken();
      const refreshToken=user.generateRefreshToken();
      user.refreshToken=refreshToken;
      await user.save({validateBeforeSave:false})//as this save will think multiple attributes is changed so to validate them again before saving but here we know only refresh token is changed. 
      return {accessToken,refreshToken};
}
  catch(err){
      throw new ApiError(500,"Somenthing went wrong while genrating access and refresh token");
  }

}

const userRegister=asyncHandler( async (req,res)=>{ 
      //Algorithm to register user
      //1. Get user details from frontend.
      //2. Validate getted data(not empty).
      //3. Check if user is not registered already using email or username.
      //4. Check for images,check for avatar(required in user.model.js).
      //5. Upload them(file) to cloudinary.
      //6. Create user object(json in nosql DB) -create entry in DB.
      //7. Remove password and refresh token when returning response to user.
      //8. Check fo user creation.
      //9. return response.

                                       
      //1
      // console.log("Displaying req.body")
      // console.log(req.body)
      const {fullName,email,userName,password}=req.body  
      console.log("E-mail: ",email)
      //2
      if(
            [fullName,email,userName,password].some((field)=>
                  field?.trim()===""
            )
      ){
         throw new ApiError(400,"All fields are required")
} 
      //3
      const existedUser=await User.findOne({
            $or:[{userName},{email}]//this to check if userName is there or email is there then throw error.
      })
      if(existedUser){
            throw new ApiError(409,"User with this userName or Email exist")
      }
      // console.log("Displaying req.files")
      // console.log(req.files)
      //4
      const avatarLocalpath=req.files?.avatar[0]?.path;//giving local file path stored on public/temp before uploading itto cloudinary
      // const coverImageLocalPath=req.files?.coverImage[0]?.path;//giving local file path stored on public/temp before uploading itto cloudinary
      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length >0 ){
            coverImageLocalPath=req.files.coverImage[0].path
      }
      if(!avatarLocalpath){
            throw new ApiError(404,"Avatar file is required")
      }
      
      //5
      console.log(avatarLocalpath)
      const avatar=   await uploadOnCloudinary(avatarLocalpath)
      const coverImage=await uploadOnCloudinary(coverImageLocalPath)
     console.log(avatar)
      if(!avatar){
            throw new ApiError(404,"Avatar file is required")
      }
      
      //6
      const user=await User.create({    
            fullName,
            email,
            userName:userName.toLowerCase(),
            password,
            avatar:avatar.url, //as cloudinary will return whole response object we have to extract .url from it.
            coverImage:coverImage?.url || "",//as this is not required field in user.model.js
      })

      const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"//this means not to select(send) password and refreshToken in response.
      )
      if(!createdUser){
            throw new ApiError(500,"Internal server error")//500 status code because all are correctly passed but this not creation of createdUser is due to backend.
      }
      return res
               .status(201)
               .json(
                  new ApiResponse(200,createdUser,"User registered Successfully")
               );
})

const loginUser=asyncHandler(async(req,res)=>{ 
      //Algorithm for Login user
      //1.User data from <-req.body
      //2.Check for email or username exist or not.
      //3.Validate password.
      //4.Access and refresh token.
      //5.Send token in cookies.

      //1.
      const{userName,email,password}=req.body;
      if(!(userName || email)){
            throw new ApiError(400,"Email or Username(anyone) is required");
      }
      
      //2.
      const user=await User.findOne({
            $or:[{userName},{email}]
      })
      if(!user){
            throw new ApiError(402,"Username or Email not exist");
      }
      const passwordChecker=await user.isPasswordCorrect(password)
      if(!passwordChecker){
            throw new ApiError(401,"Invalid suer credentials");
      }
      
      const {accessToken,refreshToken}=await  generateAccessAndRefereshTokens(user);
      const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

      if(!loggedInUser){
            throw new ApiError(500,"Something went wrong while login user")
      }
       console.log(loggedInUser);
      const options={
          httpOnly:true,//Prevents access via JavaScript (document.cookie cannot read it).
          secure:true,// Ensures cookies are transmitted only over HTTPS(not http), enhancing security.
      }
      return res.
      status(202).
      cookie("accesstoken",accessToken,options).
      cookie("refreshtoken",refreshToken,options).
      json(    
            new ApiResponse( 202,
             {
                  loggedInUser,accessToken,refreshToken
             },
             "User logged in successfully"
            )
      )
})
 
const logoutUser=asyncHandler(async(req,res)=>{ 
      //Algorithm
      //1.get user data from req.user(auth.middleware.js)
      //2.Remove refreshtoken from user.
      await User.findByIdAndUpdate(
            req.user._id,
            {
              $unset:{
                  refreshToken:1//removes from document strutur in mongoDB.
                     }
            },
            {
                  new:true,// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }.
            }
            )
            const option={
                  httpOnly:true,
                  secure:true,
            }
            console.log("Logged out successfully");
            res.status(201)
            .clearCookie("refreshtoken",option)//while clearing he cookie attributes (like httpOnly, secure, sameSite, path) exactly match those used when setting the cookie to ensure correct cookies are erased not other.
            .clearCookie("accesstoken",option)
            .json(new ApiResponse(202,{},"Logged out succesfully"));
})

const refreshAccessToken=asyncHandler(async(req,res)=>{  
      
      //Algorithm
      //1.verify incomingrefresh token with DB stored refreshtoken.
      //2.If correct then genrate new access and refresh token and pass it in cookies.
      const incomingRefreshToken=req.cookies.refreshToken  || req.body.refreshToken//If requested from laptop || if trequested from mobile.
      if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
      }
      try {
            const decodedRefreshToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
            console.log(decodedRefreshToken)
            const user=await User.findById(decodedRefreshToken?._id) 
            if(!user) throw new ApiError(404,"Invalid Refresh Token")
                  console.log(user);
            if(incomingRefreshToken!==user.refreshToken) throw new ApiError(402,"Refresh roken is expired")//is using old refresh token in which user id is stored to verify is refres toke same as in databse or diffrent.
            const {accessToken,refreshToken} =generateAccessAndRefereshTokens(user)
            const options={
                  httpOnly:true,
                  secure:true,
            }
      
            return res.status(201)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                  new ApiResponse(200,{refreshToken,accessToken})
            )
            
      } catch (error) {
            throw new ApiError(401,error.message || "Invalid refreshToken")
      }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
      const {oldPassword, newPassword} = req.body

      const user = await User.findById(req.user?._id)
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  
      if (!isPasswordCorrect) {
          throw new ApiError(400, "Invalid old password")
      }
  
      user.password = newPassword
      await user.save({validateBeforeSave: false})
  
      return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"))
  })
  
  const getCurrentUser = asyncHandler(async(req, res) => {
      return res
      .status(200)
      .json(new ApiResponse(
          200,
          req.user,
          "User fetched successfully"
      ))
  })
  
  const updateAccountDetails = asyncHandler(async(req, res) => {
      const {fullName, email} = req.body
  
      if (!fullName || !email) {
          throw new ApiError(400, "All fields are required")
      }
  
      const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set: {
                  fullName,
                  email: email
              }
          },
          {new: true}// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }
          
      ).select("-password")
  
      return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))
  });
  
  const updateUserAvatar = asyncHandler(async(req, res) => {
      const avatarLocalPath = req.file?.path
  
      if (!avatarLocalPath) {
          throw new ApiError(400, "Avatar file is missing")
      }
  
      //TODO: delete old image - assignment
  
      const avatar = await uploadOnCloudinary(avatarLocalPath)
  
      if (!avatar.url) {
          throw new ApiError(400, "Error while uploading on avatar")
          
      }
  
      const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set:{
                  avatar: avatar.url
              }
          },
          {new: true}// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }
      ).select("-password")
  
      return res
      .status(200)
      .json(
          new ApiResponse(200, user, "Avatar image updated successfully")
      )
  })
  
  const updateUserCoverImage = asyncHandler(async(req, res) => {
      const coverImageLocalPath = req.file?.path
  
      if (!coverImageLocalPath) {
          throw new ApiError(400, "Cover image file is missing")
      }
  
      //TODO: delete old image - assignment
  
  
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
      if (!coverImage.url) {
          throw new ApiError(400, "Error while uploading on avatar")
          
      }
  
      const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set:{
                  coverImage: coverImage.url
              }
          },
          {new: true}// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }
      ).select("-password")
  
      return res
      .status(200)
      .json(
          new ApiResponse(200, user, "Cover image updated successfully")
      )
  })
  
  const getUserChannelProfile = asyncHandler(async(req, res) => {
      const {username} = req.params
  
      if (!username?.trim()) {
          throw new ApiError(400, "username is missing")
      }
  
      const channel = await User.aggregate([
          {
              $match: {
                  username: username?.toLowerCase()
              }
          },
          {
              $lookup: {
                  from: "subscriptions",
                  localField: "_id",
                  foreignField: "channel",
                  as: "subscribers"
              }
          },
          {
              $lookup: {
                  from: "subscriptions",
                  localField: "_id",
                  foreignField: "subscriber",
                  as: "subscribedTo"
              }
          },
          {
              $addFields: {
                  subscribersCount: {
                      $size: "$subscribers"
                  },
                  channelsSubscribedToCount: {
                      $size: "$subscribedTo"
                  },
                  isSubscribed: {
                      $cond: {
                          if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                          then: true,
                          else: false
                      }
                  }
              }
          },
          {
              $project: {
                  fullName: 1,
                  username: 1,
                  subscribersCount: 1,
                  channelsSubscribedToCount: 1,
                  isSubscribed: 1,
                  avatar: 1,
                  coverImage: 1,
                  email: 1
  
              }
          }
      ])
  
      if (!channel?.length) {
          throw new ApiError(404, "channel does not exists")
      }
  
      return res
      .status(200)
      .json(
          new ApiResponse(200, channel[0], "User channel fetched successfully")
      )
  })
  
  
  export {
    userRegister,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
        }
