import mongoose, { Schema, Document } from 'mongoose';

export interface IPaste extends Document {
  paste_id: string;
  user_id?: mongoose.Types.ObjectId;
  content: string;
  content_type?: string;
  file_data?: Buffer;
  file_name?: string;
  file_size?: number;
  slug?: string;
  created_at: Date;
  expires_at?: Date;
  delete_token?: string;
}

const PasteSchema: Schema = new Schema({
  paste_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  content: {
    type: String,
    required: true
  },
  content_type: {
    type: String,
    default: 'text/plain'
  },
  file_data: {
    type: Buffer,
    required: false
  },
  file_name: {
    type: String,
    required: false
  },
  file_size: {
    type: Number,
    required: false
  },
  slug: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: false
  },
  delete_token: {
    type: String,
    maxlength: 64
  }
});

// Indexes
PasteSchema.index({ user_id: 1, created_at: -1 });
PasteSchema.index({ expires_at: 1 }, { sparse: true });
PasteSchema.index({ slug: 1 }, { sparse: true });

export const Paste = mongoose.model<IPaste>('Paste', PasteSchema);
