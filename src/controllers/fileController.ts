import * as Minio from 'minio';
import dotenv from 'dotenv';
import User, { IUser, AuthenticatedRequest } from '../models/User';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
dotenv.config();


const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: `${process.env['MINIO_ACCESS_KEY']}`,
  secretKey: `${process.env['MINIO_SECRET_KEY']}`
})



const user_bucket = 'user-files'


// Create a bucket if it doesn't exist
export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }
}


createBucketIfNotExists(user_bucket);



export const uploadFileController = async (req: Request, res: Response) => {

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const file = req.file;
  const filePath = path.resolve(file.path);
  if (file.size > 1024 * 1024 || file.mimetype !== 'image/jpeg') {
    fs.unlinkSync(filePath);
    return res.status(400).send('wrong file');
  }

  try {
    await minioClient.fPutObject(user_bucket, file.filename, filePath);
    res.status(200).send({ message: 'File uploaded successfully', fileName: file.filename });
  } catch (error) {
    res.status(500).send({ error: error });
  }
  // Remove the file from local uploads folder after upload
  fs.unlinkSync(filePath);

}



// export const storage = async (req: Request, res: Response): Promise<void> => {
//     const { files } = req.body;
//     const { originalname, buffer } = files;

//     try {
//         await minioClient.putObject('files', originalname, buffer);
//         res.status(201).json({ message: 'File uploaded successfully' });
//     } catch (error) {
//         res.status(500).json({ error: 'Error uploading file' });
//     }
// }
