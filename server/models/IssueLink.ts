import mongoose, { Schema, Document } from 'mongoose';

export type LinkType = 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'duplicated_by';

export interface IIssueLink extends Document {
  source_issue_id: mongoose.Types.ObjectId;
  target_issue_id: mongoose.Types.ObjectId;
  link_type: LinkType;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
}

const IssueLinkSchema: Schema = new Schema({
  source_issue_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  target_issue_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  link_type: {
    type: String,
    enum: ['blocks', 'blocked_by', 'relates_to', 'duplicates', 'duplicated_by'],
    required: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate links
IssueLinkSchema.index({ source_issue_id: 1, target_issue_id: 1, link_type: 1 }, { unique: true });
IssueLinkSchema.index({ source_issue_id: 1 });
IssueLinkSchema.index({ target_issue_id: 1 });

export const IssueLink = mongoose.model<IIssueLink>('IssueLink', IssueLinkSchema);
