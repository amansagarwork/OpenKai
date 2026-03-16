import mongoose, { Schema, Document } from 'mongoose';

export interface ITerminalSession extends Document {
  session_id: string;
  user_id: mongoose.Types.ObjectId;
  name?: string;
  status: 'active' | 'closed' | 'archived';
  created_at: Date;
  updated_at: Date;
  closed_at?: Date;
}

const TerminalSessionSchema: Schema = new Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    length: 21
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  closed_at: {
    type: Date
  }
});

// Indexes
TerminalSessionSchema.index({ user_id: 1 });
TerminalSessionSchema.index({ status: 1 });

export const TerminalSession = mongoose.model<ITerminalSession>('TerminalSession', TerminalSessionSchema);
