import mongoose, { Schema, Document } from 'mongoose';

export interface IUserHistory extends Document {
  user_id: mongoose.Types.ObjectId;
  item_type: string;
  item_id?: string;
  file_name?: string;
  file_size?: number;
  content_type?: string;
  action: string;
  metadata?: any;
  created_at: Date;
}

const UserHistorySchema: Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item_type: {
    type: String,
    required: true
  },
  item_id: {
    type: String
  },
  file_name: {
    type: String
  },
  file_size: {
    type: Number
  },
  content_type: {
    type: String
  },
  action: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
UserHistorySchema.index({ user_id: 1 });
UserHistorySchema.index({ created_at: -1 });
UserHistorySchema.index({ item_type: 1 });

export const UserHistory = mongoose.model<IUserHistory>('UserHistory', UserHistorySchema);
