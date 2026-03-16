import mongoose, { Schema, Document } from 'mongoose';

export interface IIssueHistory extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  field: string;
  old_value?: string;
  new_value?: string;
  created_at: Date;
}

const IssueHistorySchema: Schema = new Schema({
  issue_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  field: {
    type: String,
    required: true,
    maxlength: 100
  },
  old_value: {
    type: String
  },
  new_value: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
IssueHistorySchema.index({ issue_id: 1 });
IssueHistorySchema.index({ created_at: -1 });

export const IssueHistory = mongoose.model<IIssueHistory>('IssueHistory', IssueHistorySchema);
