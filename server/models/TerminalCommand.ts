import mongoose, { Schema, Document } from 'mongoose';

export interface ITerminalCommand extends Document {
  session_id: string;
  user_id: mongoose.Types.ObjectId;
  command: string;
  stdout?: string;
  stderr?: string;
  exit_code: number;
  working_directory?: string;
  executed_at: Date;
}

const TerminalCommandSchema: Schema = new Schema({
  session_id: {
    type: String,
    required: true,
    ref: 'TerminalSession'
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  command: {
    type: String,
    required: true
  },
  stdout: {
    type: String
  },
  stderr: {
    type: String
  },
  exit_code: {
    type: Number,
    default: 0
  },
  working_directory: {
    type: String,
    maxlength: 500
  },
  executed_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
TerminalCommandSchema.index({ session_id: 1 });
TerminalCommandSchema.index({ user_id: 1 });
TerminalCommandSchema.index({ executed_at: -1 });

export const TerminalCommand = mongoose.model<ITerminalCommand>('TerminalCommand', TerminalCommandSchema);
