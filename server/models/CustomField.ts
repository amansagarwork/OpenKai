import mongoose, { Schema, Document } from 'mongoose';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'user';

export interface ICustomField extends Document {
  name: string;
  key: string;
  type: CustomFieldType;
  description?: string;
  options?: string[];
  required: boolean;
  default_value?: any;
  created_at: Date;
  updated_at: Date;
}

const CustomFieldSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  key: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select', 'multi_select', 'checkbox', 'user'],
    required: true
  },
  description: {
    type: String
  },
  options: {
    type: [String],
    default: []
  },
  required: {
    type: Boolean,
    default: false
  },
  default_value: {
    type: Schema.Types.Mixed
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
CustomFieldSchema.index({ key: 1 });

export const CustomField = mongoose.model<ICustomField>('CustomField', CustomFieldSchema);
