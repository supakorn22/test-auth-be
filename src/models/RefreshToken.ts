import mongoose, { Schema, Document } from 'mongoose';

interface IRefreshToken extends Document {
    token: string;
    userId: string;
    createdAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' }
});

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
