import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import Like from '@/models/like';



const unlikeBlog = async (req: Request, res: Response) => {

  const { blogId } = req.params;
  const { userId } = req.body;

  try {
    // 1º se borra el like de su tabla
    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
    if (!existingLike) {
      res.status(404).json({
        code: "NotFound",
        message: "Like not found"
      });
      return;
    }

    await Like.deleteOne({ _id: existingLike._id });

    // 2º se resta el like al blog
    const blog = await Blog.findById(blogId).select('likesCount').exec();
    if (!blog) {
      return res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
    }

    blog.likesCount--;
    await blog.save();

    logger.info("Blog unliked successfully.", {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount
    });

    return res.status(200).json({
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

export default unlikeBlog