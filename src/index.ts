import express from 'express';
import dotenv from 'dotenv';
// import morgan from 'morgan';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import mainRouter from './routes';
import mongoose from 'mongoose';
import cors from 'cors';


dotenv.config();






const app = express();
const port = process.env.PORT

// Middleware
app.use(express.json());
// app.use(morgan(':method :host :status :res[content-length] - :response-time ms'))
app.use(logger('dev'));
app.use(cookieParser());
app.use(cors(
  {
    origin: ['http://localhost:3000','https://localhost:3001'],
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});