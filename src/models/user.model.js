import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema= new Schema({
    userName:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,//removes white spaces
        index:true,//this creates index on username field which helps in locating document without scanning the entire collection inshort optimize searching on username field.
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    fullName:{
      type:String,
      required:true,
      trim:true,
      index:true,
    },
    avatar:{
        type:String,//Comes from cloudinary url
        required:true,
    },
    coverImage:{
        type:String,//Comes from cloudinary url
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    watchHistory:[
        {
           type:Schema.Types.ObjectId,
           ref:"Video",
        }
    ],
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true
})
 
//here arrow function will not work as it does not have this context init.
userSchema.pre("save",async function(next){//next is required as middle ware required to tell at last go to next middleware.
    if(!this.isModified("password"))  return next();//this is required as whenever comes to update full name then also new passwrod is encrypted.
    this.password=await bcrypt.hash(this.password,10)
    next();
})
userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {//this is payload(data)  to be encrypted
            _id:this._id,
            email: this.email,
            userName:this.userName,
            fullName:this.fullName
        },
         process.env.ACCESS_TOKEN_SECRET,
         {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
         }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {//this is payload(data)  to be encrypted
            _id:this._id,
        },
         process.env.REFRESH_TOKEN_SECRET,
         {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
         }
    )
}
export const User=mongoose.model("User",userSchema);