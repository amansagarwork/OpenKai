import mongoose, { Schema, Document } from 'mongoose';

export interface IShortenedUrl extends Document {
  short_id: string;
  original_url: string;
  user_id?: mongoose.Types.ObjectId;
  clicks: number;
  created_at: Date;
}

const ShortenedUrlSchema: Schema = new Schema({
  short_id: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  original_url: {
    type: String,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  clicks: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
ShortenedUrlSchema.index({ user_id: 1 });
ShortenedUrlSchema.index({ created_at: -1 });

export const ShortenedUrl = mongoose.model<IShortenedUrl>('ShortenedUrl', ShortenedUrlSchema);
