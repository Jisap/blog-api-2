import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import type { IBlog } from '@/models/Blog';
import Like from '@/models/like';



const likeBlog = async (req: Request, res: Response) => {

  const { blogId } = req.params;
  const { userId } = req.body;

  try {
    const blog = await Blog.findById(blogId).select('likesCount').exec();
    if (!blog) {
      return res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
    }

    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
    if (existingLike) {
      res.status(400).json({
        code: "BadRequest",
        message: "You already liked this blog"
      });
      return;
    }

    await Like.create({ blogId, userId });
    blog.likesCount++;
    await blog.save();

    logger.info("Blog liked successfully.", {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount
    });

    return res.status(201).json({
      likesCount: blog.likesCount
    });

  } catch (error) {
    logger.error("Error while liking blog.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default likeBlog