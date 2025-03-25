//this is template for all asynchronous route handling function to handle error if occured  and no need to write promises and try catch each time.
//this is wrapaper for controller's.
const asyncHandler=(requestHandler)=>{
    return  (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>{
            next(err);// handle errors in asynchronous operations (like database calls, API requests, or file I/O) and forward them to Express's centralized error-handling middleware.
        })
    }
}
export {asyncHandler}
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