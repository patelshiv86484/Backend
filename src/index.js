import dbconnection from "./db/index.js"
import express from "express"
// dotenv.config({     //this is not required as this scirpt in package.json (-r dotenv/config) preloads environment variable in process.env from .env file befor script runs.
//     path:'/.env'
// })

const app=express();

dbconnection().
then(()=>{
    app.on("error",(err)=>{//this error event listener must be there before app.listen() as both are synchronous operation.
        console.log("App listens error: ",err)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port number: ${process.env.PORT || 8000}`)
    })
}).
catch((err)=>{
    console.log("Error DB connection failed (in src/index) ",err)
})


/*
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(err)=>{
            console.log("Error :: ",err)
            throw error 
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App listening on port number: ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR:: ",error)
        throw error
    }
   
})()
//Immediately Invoked Async Function Expression (IIAFE).
*/