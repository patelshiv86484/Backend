import { Router } from "express";
import {userRegister,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router=Router()

   router.route("/register").post(
    upload.fields([//use middleware just before controller.
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ])
    ,userRegister)//this will seen in url as "/api/v1/users/register" it is like app.post("url",controller(userRegister)).
    
    router.route("/login").post(loginUser)


    //Secured routes (using verifyJWT)
    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    router.route("/change-password").post(verifyJWT,changeCurrentPassword);
    router.route("/current-user").get(verifyJWT,getCurrentUser)//using get method as nothing to send over here(*tokens)
    router.route("/update-account").patch(verifyJWT,updateAccountDetails)//because no validation check is to be done is it correct or not like in change current password as verified already by verifyJWT so use patch otherwise post.
    router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)//here .single() instead of .fields() because getting one file only check in updateUserAvatar controller using req.file instead of req.files in register controller.
    router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
    //Testing Remaining in post-man.
    router.route("/c/:username").get(verifyJWT,getUserChannelProfile)// /c/ is a static prefix (often meaning "channel") to differentiate between normal user profile and channel in this way GET /users/johndoe  → Get user profile GET /c/johndoe      → Get user’s channel. using get because not sending any data to server just taking username for url.
    router.route("/history").get(verifyJWT,getWatchHistory)
 
    export default router;