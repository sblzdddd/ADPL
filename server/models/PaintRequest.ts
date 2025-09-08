import mongoose, { Schema, type Document } from 'mongoose';

export interface IComment {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  parentComment?: mongoose.Types.ObjectId; // For replies
  replies?: mongoose.Types.ObjectId[]; // Array of reply comment IDs
}

export interface IPaintRequest extends Document {
  _id: mongoose.Types.ObjectId;
  image: {
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    size: number;
    width?: number;
    height?: number;
    originalFilename?: string;
  };
  coordinates: {
    TlX: number;
    TlY: number;
    Px: number;
    Py: number;
  };
  title: string;
  owner: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false,
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
});

const PaintRequestSchema = new Schema<IPaintRequest>({
  image: {
    url: {
      type: String,
      required: false,
      default: undefined,
    },
    thumbnailUrl: {
      type: String,
      required: false,
      default: undefined,
    },
    mediumUrl: {
      type: String,
      required: false,
      default: undefined,
    },
    size: {
      type: Number,
      required: false,
      default: 0,
      max: 2 * 1024 * 1024, // 2MB max
    },
    width: {
      type: Number,
      required: false,
      default: undefined,
    },
    height: {
      type: Number,
      required: false,
      default: undefined,
    },
    originalFilename: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  coordinates: {
    TlX: {
      type: Number,
      required: true,
    },
    TlY: {
      type: Number,
      required: true,
    },
    Px: {
      type: Number,
      required: true,
    },
    Py: {
      type: Number,
      required: true,
    },
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [CommentSchema],
}, {
  timestamps: true,
});

// Index for better query performance
PaintRequestSchema.index({ owner: 1, createdAt: -1 });
PaintRequestSchema.index({ createdAt: -1 });

export const PaintRequest = mongoose.model<IPaintRequest>('PaintRequest', PaintRequestSchema);
