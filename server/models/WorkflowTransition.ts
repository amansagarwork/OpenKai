import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowTransition extends Document {
  from_status: string;
  to_status: string;
  require_assignee: boolean;
  require_estimate: boolean;
  allowed_types: string[];
  created_at: Date;
}

const WorkflowTransitionSchema: Schema = new Schema({
  from_status: {
    type: String,
    required: true,
    enum: ['backlog', 'selected', 'in-progress', 'done']
  },
  to_status: {
    type: String,
    required: true,
    enum: ['backlog', 'selected', 'in-progress', 'done']
  },
  require_assignee: {
    type: Boolean,
    default: false
  },
  require_estimate: {
    type: Boolean,
    default: false
  },
  allowed_types: {
    type: [String],
    enum: ['story', 'task', 'bug', 'epic'],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate transitions
WorkflowTransitionSchema.index({ from_status: 1, to_status: 1 }, { unique: true });

export const WorkflowTransition = mongoose.model<IWorkflowTransition>('WorkflowTransition', WorkflowTransitionSchema);
