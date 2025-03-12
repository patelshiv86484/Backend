import { Router } from "express";
import {userRegister,loginUser,logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
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
    //Secured

    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    export default router;