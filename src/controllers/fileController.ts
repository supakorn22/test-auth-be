import * as Minio from 'minio';
import dotenv from 'dotenv';
import User, { IUser, AuthenticatedRequest } from '../models/User';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
dotenv.config();

// //for minio
// const minioClient = new Minio.Client({
//   endPoint: 'localhost',
//   port: 9000,
//   useSSL: false,
//   accessKey: `${process.env['MINIO_ACCESS_KEY']}`,
//   secretKey: `${process.env['MINIO_SECRET_KEY']}`
// })

// const user_bucket = 'user-files'

// for s3
const minioClient = new Minio.Client({
  endPoint: 's3.amazonaws.com',
  useSSL: true,
  accessKey: `${process.env['AWS_ACCESS_KEY_ID']}`,
  secretKey: `${process.env['AWS_SECRET_ACCESS_KEY']}`
});

const user_bucket = 'test-s3-pooh'

// Create a bucket if it doesn't exist
export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }
}


createBucketIfNotExists(user_bucket);



export const uploadFileController = async (req: Request, res: Response) => {

  // Check if file is present
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


export const downloadFile = async (req: Request, res: Response) => {
  const { bucketName, filePath } = req.params;

  const trimmedBucketName = bucketName.trim();
  const trimmedFilePath = filePath.trim();

  try {
    const stream = await minioClient.getObject(trimmedBucketName, trimmedFilePath);

    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (err) => {
      res.status(500).send(err.message);
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const listFiles = async (req: Request, res: Response) => {
  const { bucketName, folderPath } = req.params;

  const trimmedBucketName = bucketName.trim();
  const trimmedFolderPath = folderPath ? folderPath.trim() : '';

  try {
    const objectsList: Minio.BucketItem[] = [];
    const stream = minioClient.listObjects(trimmedBucketName, trimmedFolderPath, true);

    stream.on('data', (obj) => {
      if (obj) {
        return objectsList.push(obj);
      }
    });

    stream.on('end', () => {
      res.json(objectsList);
    });

    stream.on('error', (err) => {
      res.status(500).send(err.message);
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const statFile = async (req: Request, res: Response) => {
  const { bucketName, filePath } = req.params;

  const trimmedBucketName = bucketName.trim();
  const trimmedFilePath = filePath.trim();

  try {
    const stat = await minioClient.statObject(trimmedBucketName, trimmedFilePath);
    res.json(stat);
  } catch (err) {
    res.status(500).send(err);
  }
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
