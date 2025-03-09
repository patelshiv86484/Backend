import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt, { decode } from "jsonwebtoken"
import {User} from "../models/user.model.js"
//this middleware is designed to add req.user from JWT token(available data for loging out user adn other scenario where user credentials are required but not avialable so take them from jwt token).
const verifyJWT=asyncHandler(async(req,_,next)=>{//_ inplace of res as of no use over here.
    try {
        const token=req.cookies?.accessToken || req.header("Authorization");//client request with authorization header. Authorization: Bearer my_jwt_token
        if(!token){
            throw new ApiError(401,"Unauthorized reuest")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken){
            throw new ApiError(402,"Invalid accesstoken")
        }
        const user=await User.findById(decodedToken._id).select("-passwrod -refreshToken")
        req.user=user;
        next()//as middleware so next() is required over here to go tologoutUser function.
    }
     catch (error) {
        throw new ApiError( "Invalid access token" )
    }
})

export {verifyJWT};