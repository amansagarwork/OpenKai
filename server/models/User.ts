import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  settings: {
    emailNotifications: boolean;
    darkMode: boolean;
    twoFactorAuth: boolean;
  };
  favorites: Array<{
    id: string;
    type: 'paste' | 'url';
    title: string;
    slug: string;
    createdAt: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 320
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9_-]{3,50}$/
  },
  password_hash: {
    type: String,
    required: true,
    maxlength: 255
  },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false }
  },
  favorites: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['paste', 'url'], required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

// No additional indexes needed - unique: true on fields already creates them

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
