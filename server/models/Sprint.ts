import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
  name: string;
  goal?: string;
  state: 'future' | 'active' | 'closed';
  start_date?: Date;
  end_date?: Date;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const SprintSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255
  },
  goal: {
    type: String
  },
  state: {
    type: String,
    enum: ['future', 'active', 'closed'],
    default: 'future'
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
SprintSchema.index({ state: 1 });
SprintSchema.index({ created_by: 1 });
SprintSchema.index({ created_at: -1 });

export const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);
