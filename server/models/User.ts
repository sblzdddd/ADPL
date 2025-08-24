import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  picture?: string;
  banned: boolean;
  bannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    required: false,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  bannedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', UserSchema);
