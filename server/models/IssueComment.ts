import mongoose, { Schema, Document } from 'mongoose';

export interface IIssueComment extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  content: string;
  created_at: Date;
  updated_at: Date;
}

const IssueCommentSchema: Schema = new Schema({
  issue_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
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

// Indexes
IssueCommentSchema.index({ issue_id: 1 });
IssueCommentSchema.index({ created_at: 1 });

export const IssueComment = mongoose.model<IIssueComment>('IssueComment', IssueCommentSchema);
