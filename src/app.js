import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
const app=express()

//app.use(cors()) Enable CORS for defined origins.
app.use(cors({
    origin:process.env.CORS_ORIGIN || "*",//limits to specific origins only
    credentials:true,// Allow cookies & authentication
}))

app.use(express.json({limit:"16kb"}));//use this for REST APIs receiving JSON.
app.use(express.urlencoded({extended:true,limit:"16kb"}));//use this for handling HTML forms.
app.use(express.static("public"))//store favicon and files folder in public(local storage).
app.use(cookieParser());//this will allow user and server to perform CRUD operation on cookies in user browser and allows to use .cookie().

//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter);//here instead of app.get(route,controller) this middleware is used because all are in different folders. 
 
export {app}  //export this everywhere not to do re-declaration as const app=express()  in other files as all will create their own context and middleware's like app.use(json()) is not applied in all  so keep universal app variable of express() only.