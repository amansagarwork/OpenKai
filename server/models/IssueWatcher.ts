import mongoose, { Schema, Document } from 'mongoose';

export interface IIssueWatcher extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const IssueWatcherSchema: Schema = new Schema({
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
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate watchers
IssueWatcherSchema.index({ issue_id: 1, user_id: 1 }, { unique: true });
IssueWatcherSchema.index({ user_id: 1 });

export const IssueWatcher = mongoose.model<IIssueWatcher>('IssueWatcher', IssueWatcherSchema);
