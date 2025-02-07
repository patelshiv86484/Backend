//this is template for all asynchronous routehandling function to handle error if occured.
const asynHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>{
            next(err);// handle errors in asynchronous operations (like database calls, API requests, or file I/O) and forward them to Express's centralized error-handling middleware.
        })
    }
}

export {asynHandler}
//-------------------------------------------------OR-------------------------------------------------

//Try Catch type
// const asynHandler=(requestHandler)=>{
//        return  async (req,res,next)=>{
//          try{
//                await requestHandler(res,res,next);
//          }
//          catch(err){
//             res.status(err.code || 500).json({
//                             success: false,
//                             message: err.message
//                         })
//          }
//        }
// }