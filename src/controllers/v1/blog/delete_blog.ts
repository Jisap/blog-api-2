import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import User from '@/models/user';
import { v2 as cloudinary } from 'cloudinary';




const deleteBlog = async (req: Request, res: Response) => {

  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').exec();
    const blog = await Blog.findById(blogId).select('author banner.publicId').lean().exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found"
      });
      return;
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: "AuthorizationError",
        message: "Access denied, insufficient permision"
      });

      logger.warn("A user tried to update a blog without permission", {
        userId,
        userRole: user?.role
      });
      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info("Blog banner deleted successfully from Cloudinary.", {
      publicId: blog.banner.publicId
    });

    await Blog.deleteOne({ _id: blogId });
    logger.info("Blog deleted successfully.", { blog });

    return res.status(200).json({
      blog
    });

  } catch (error) {
    logger.error("Error during blog deletion.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default deleteBlog