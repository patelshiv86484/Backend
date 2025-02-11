import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {//cd stands for callback
      cb(null, '/public/temp')//store passed file in argument to this path folder.
    },
    filename: function (req, file, cb) {
        console.log(file);
      cb(null, file.originalname )
    }
  })
  
export const upload= multer({ 
    storage, 
})