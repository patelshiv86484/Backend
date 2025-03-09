import multer from "multer";
// Difference Between diskStorage and memoryStorage in Multer
// Multer provides two ways to store uploaded files:

// diskStorage → Temporarily saves files on the server before processing.
// memoryStorage → Stores files in RAM (buffer) and directly processes them without saving to disk.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {//cd stands for callback
      cb(null, "./public/temp")//store passed file in argument to this path folder(path is W.R.T to package.json directory of nodeJS where application runs).
    },
    filename: function (req, file, cb) {
        // console.log(file);
      cb(null, file.originalname )
    }
  })
export const upload= multer({ 
    storage, 
})