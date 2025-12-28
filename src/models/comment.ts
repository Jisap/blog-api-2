import { Schema, model, Types } from 'mongoose';

export interface IComment {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likesCount: number;
  replies: Types.ObjectId[];
}

/**
 * User schema
 */
const commentSchema = new Schema<IComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxLength: [1000, 'Content must be less than 1000 characters'],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    replies: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default model<IComment>('Comment', commentSchema);