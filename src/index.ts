import express from 'express';
import dotenv from 'dotenv';
// import morgan from 'morgan';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import mainRouter from './routes';
import mongoose from 'mongoose';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import http from 'http';
import path from 'path';
dotenv.config();



// Path to the SSL/TLS certificate files generated by mkcert

let httpsOptions = null;

try {
  const keyPath = path.resolve('src/localhost-key.pem');
  const certPath = path.resolve('src/localhost.pem');
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } else {
    console.log('HTTPS certificate files not found, proceeding without HTTPS options.');
  }
} catch (error) {
  console.error('Error reading HTTPS certificate files:', error);
}



const app = express();
const port = process.env.PORT || 8080;
const portHttps = process.env.PORT_HTTPS || 8081;

// Middleware
app.use(express.json());
// app.use(morgan(':method :host :status :res[content-length] - :response-time ms'))
app.use(logger('dev'));
app.use(cookieParser());
app.use(cors(
  {
    origin: ['http://localhost:3000','https://localhost:3001','https://localhost:3000','http://localhost:3001','https://localhost:3002'],
    credentials: true
  }

));


// MongoDB connection string
const mongoURI = `mongodb://${process.env['MONGO_INITDB_ROOT_USERNAME']}:${process.env['MONGO_INITDB_ROOT_PASSWORD']}@localhost:27017/${process.env.MONGO_DB_NAME}?authSource=admin`;
console.log(mongoURI);

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



app.use('/', mainRouter); // Use the main router


// Creating HTTP server
http.createServer(app).listen(port, () => {
  console.log(`HTTP server is running on http://localhost:${port}`,);
});


// Creating HTTPS server

if (httpsOptions) {
https.createServer(httpsOptions, app).listen(portHttps, () => {
  console.log(`HTTPS server is running on https://localhost${portHttps}`, );
});
}
