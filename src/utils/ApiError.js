// This ApiError class is created to Standardize "API Error Handling"
// The built-in Error class in JavaScript only stores a message and stack trace.
// This ApiError class adds extra properties like statusCode, errors, data, and success to provide a consistent error response for API failures.


class ApiError extends Error{//this is created by extending error class because node internally rectifies error but can't response.
    constructor(
        statusCode,
        message="Somethign went wrong",
        errors=[],
        stack="",//this capture the stack trace at the point where the error was created
    ){
        super(message);//this will do this.message=message
        this.statusCode=statusCode,
        this.errors=errors;
        this.data=null;
        this.success=false;//as failed to get apiresponse
        if(stack){
            this.stack=stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor);//here  this.constructor is excluded in tracing adn on this tracing is done.
        }
    }
}

export {ApiError}