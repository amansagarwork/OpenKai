import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  itemId: string;
  itemType: string; // 'tool', 'paste', 'url', etc.
  title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  itemId: {
    type: String,
    required: true,
    index: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['tool', 'paste', 'url', 'project'],
    default: 'tool'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for better performance
FavoriteSchema.index({ userId: 1, itemId: 1 }, { unique: true });
FavoriteSchema.index({ itemId: 1, itemType: 1 });
FavoriteSchema.index({ createdAt: -1 });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
