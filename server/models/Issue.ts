import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  key: string;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'backlog' | 'selected' | 'in-progress' | 'done';
  assignee_id?: mongoose.Types.ObjectId;
  reporter_id?: mongoose.Types.ObjectId;
  sprint_id?: mongoose.Types.ObjectId;
  parent_id?: mongoose.Types.ObjectId;
  story_points?: number;
  labels: string[];
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  custom_fields?: Map<string, any>;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

const IssueSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  title: {
    type: String,
    required: true,
    maxlength: 500
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['story', 'task', 'bug', 'epic'],
    default: 'task'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['backlog', 'selected', 'in-progress', 'done'],
    default: 'backlog'
  },
  assignee_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sprint_id: {
    type: Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  story_points: {
    type: Number
  },
  labels: {
    type: [String],
    default: []
  },
  due_date: {
    type: Date
  },
  estimated_hours: {
    type: Number
  },
  actual_hours: {
    type: Number
  },
  custom_fields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date
  }
});

// Indexes
IssueSchema.index({ status: 1 });
IssueSchema.index({ sprint_id: 1 });
IssueSchema.index({ assignee_id: 1 });
IssueSchema.index({ created_at: -1 });
IssueSchema.index({ title: 'text', description: 'text', key: 'text' });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);
