import mongoose, { Document, Schema } from 'mongoose';
import { Request, Response } from 'express';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'seller' | 'customer';
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seller', 'customer'], required: true }
});

export default mongoose.model<IUser>('User', userSchema);


export interface AuthenticatedRequest extends Request {
    user?: any;
  }