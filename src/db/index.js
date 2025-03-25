 import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
 
 const connection=async ()=>{
    try{
     const conn= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
     console.log(`\n MongoDB connected !! DB HOST: ${conn.connection.host}`);
     //there is different host's for local production testing so check for host in this way.
    }
    catch(error){
        console.log("MONGODB atlas connection failed(src/db/index.js) :: ",error);
        process.exit(1);//process is part of node environment directly.
    }
}

export default connection;