import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  duration_minutes: number;
  description?: string;
  started_at?: Date;
  ended_at?: Date;
  is_running: boolean;
  created_at: Date;
}

const TimeEntrySchema: Schema = new Schema({
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
  duration_minutes: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  started_at: {
    type: Date
  },
  ended_at: {
    type: Date
  },
  is_running: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
TimeEntrySchema.index({ issue_id: 1 });
TimeEntrySchema.index({ user_id: 1 });
TimeEntrySchema.index({ created_at: -1 });

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
