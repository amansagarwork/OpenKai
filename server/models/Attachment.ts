import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  created_at: Date;
}

const AttachmentSchema: Schema = new Schema({
  issue_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  original_name: {
    type: String,
    required: true
  },
  mime_type: {
    type: String,
    required: true
  },
  size_bytes: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
AttachmentSchema.index({ issue_id: 1 });
AttachmentSchema.index({ user_id: 1 });
AttachmentSchema.index({ created_at: -1 });

export const Attachment = mongoose.model<IAttachment>('Attachment', AttachmentSchema);
