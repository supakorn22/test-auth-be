import { Router, Request, Response } from 'express';

import { uploadFileController, downloadFile, listFiles ,statFile} from '../controllers/fileController';
import path from 'path';
import multer from 'multer';
const router = Router();



// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });






// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 100*1024 * 1024 },// 1MB
// });
// router.post('/upload',
//   upload.single('file'),
//   uploadFileController
// );


// Configure storage engine and filename
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    cb(null, file.originalname);

  }
});

// Initialize upload middleware with file size limit and file type validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: function(req, file, cb) {
    // Allowed file types
    const fileTypes = /jpeg|jpg|png|gif|rar/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('worn file type, only jpeg, jpg, png, gif, rar files are allowed'));
    }
  }
});



// Initialize upload middleware and add file size limit


router.post('/upload',
  upload.single('file'),
  uploadFileController
);

router.get('/download/:bucketName/:filePath(*)', downloadFile);
router.get('/list/:bucketName', listFiles);
router.get('/stat/:bucketName/:filePath(*)',statFile );

export default router;
