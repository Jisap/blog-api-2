import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import Comment from '@/models/comment';
import type { IComment } from '@/models/comment';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

type CommentData = Pick<IComment, 'content'>; // Pick only content from IComment

const window = new JSDOM('').window;          // Create a window object 
const dompurify = DOMPurify(window);          // Create a DOMPurify object


const commentBlog = async (req: Request, res: Response) => {

  const { content } = req.body as CommentData;
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();
    if (!blog) {
      return res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
    }

    const cleanContent = dompurify.sanitize(content);
    if (!cleanContent) {
      return res.status(400).json({
        code: "BadRequest",
        message: "Invalid content"
      });
    }

    const newComment = await Comment.create({
      blogId,
      userId,
      content: cleanContent
    });

    logger.info('New comment created', {
      newComment
    });

    blog.commentsCount++;
    await blog.save();

    logger.info("Blog comments count updated.", {
      blogId: blog._id,
      commentsCount: blog.commentsCount
    });

    return res.status(201).json({
      comment: newComment
    });

  } catch (error) {
    logger.error("Error while commenting blog.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default commentBlog