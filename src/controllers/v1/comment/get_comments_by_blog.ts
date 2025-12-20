import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import Comment from '@/models/comment';
import type { IComment } from '@/models/comment';



const getCommentsByBlog = async (req: Request, res: Response) => {

  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();
    if (!blog) {
      return res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
    }

    const allComments = await Comment.find({ blogId }).sort({ createdAt: -1 }).lean().exec();

    return res.status(201).json({
      comments: allComments
    });

  } catch (error) {
    logger.error("Error while getting comments by blog.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default getCommentsByBlog