import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import User from '@/models/user';
import type { IBlog } from '@/models/Blog';


type BlogData = Partial<Pick<IBlog, "title" | "content" | "banner" | "status">>;

const window = new JSDOM('').window; // DOMPurify needs a window object
const purify = DOMPurify(window);    // DOMPurify se usa para limpiar HTML y prevenir ataques Cross-Site Scripting (XSS). 


const updateBlog = async (req: Request, res: Response) => {



  try {
    const { title, content, banner, status }: BlogData = req.body as BlogData;
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').exec();                 // Usuario que hace la petición (actualización del blog)
    const blog = await Blog.findById(blogId).select('-__v').exec();                 // Blog que se va a actualizar

    if (!blog) {
      res.status(404).json({
        code: "NotFoundError",
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

    if (title) blog.title = title;
    if (content) {
      const cleanContent = purify.sanitize(content);
      blog.content = cleanContent;
    }
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    await blog.save();

    logger.info("Blog updated successfully.", { blog });

    return res.status(200).json({
      blog
    });

  } catch (error) {
    logger.error("Error while updating blog.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default updateBlog