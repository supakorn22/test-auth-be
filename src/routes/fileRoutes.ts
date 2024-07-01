import { Router, Request, Response } from 'express';

import { uploadFileController, downloadFile, listFiles ,statFile} from '../controllers/fileController';
import path from 'path';
import multer from 'multer';
const router = Router();
const { S3Client } = require('@aws-sdk/client-s3')
import dotenv from 'dotenv';
import multerS3 from 'multer-s3';
// const multerS3 = require('multer-s3');
dotenv.config();





// Configure AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// Configure multer to use S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'test-s3-pooh',
    key:  function(req: any, file: { originalname: any; }, cb: (arg0: null, arg1: any) => void) {
          cb(null, file.originalname);
    }
  })
});



// // Initialize upload middleware and add file size limit

router.post('/upload', upload.single('file'), (req, res) => {
  res.send({
    message: 'File uploaded successfully!',
    fileUrl: req.file
  });
});

// router.post('/upload',
//   upload.single('file'),
//   uploadFileController
// );

// router.get('/download/:bucketName/:filePath(*)', downloadFile);
// router.get('/list/:bucketName', listFiles);
// router.get('/stat/:bucketName/:filePath(*)',statFile );

export default router;
