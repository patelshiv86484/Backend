import cookieParser from "cookie-parser"
import express from "express"
const app=express()

//app.use(cors()) Enable CORS for all origins
app.use(cors({
    origin:process.env.CORS_ORIGIN,//limits to specific origins only
    credntials:true,// Allow cookies & authentication
}))

app.use(express.json({limit:"16kb"}));//use this for REST APIs receiving JSON.
app.use(express.urlencoded({extended:true,limit:"16kb"}));//use this for handling HTML forms.
app.use(express.static("public"))//store favicon and files folder in public(local storage).
app.use(cookieParser());//this will allow user and server to perform CRUD operation on cookies in user browser.