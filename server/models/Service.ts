import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  href: string;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['paste', 'url', 'terminal', 'code', 'utility', 'productivity', 'development', 'security', 'media', 'data']
  },
  subcategory: {
    type: String,
    enum: ['text', 'image', 'file', 'shortener', 'executor', 'analyzer', 'generator', 'encoder', 'decoder', 'converter', 'formatter', 'validator', 'manager', 'tracker']
  },
  icon: {
    type: String,
    required: true
  },
  iconBg: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ featured: 1 });
ServiceSchema.index({ tags: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
