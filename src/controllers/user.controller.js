import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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
 
export {userRegister}