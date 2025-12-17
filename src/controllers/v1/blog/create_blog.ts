import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import type { IBlog } from '@/models/Blog';


type BlogData = Pick<IBlog, "title" | "content" | "banner" | "status">;

const window = new JSDOM('').window; // DOMPurify needs a window object
const purify = DOMPurify(window);    // DOMPurify se usa para limpiar HTML y prevenir ataques Cross-Site Scripting (XSS). 


const createBlog = async (req: Request, res: Response) => {



  try {
    const { title, content, banner, status }: BlogData = req.body as BlogData;
    const userId = req.userId;

    const cleanContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId
    });

    logger.info("Blog created successfully.", newBlog);
    return res.status(201).json({
      blog: newBlog
    });

  } catch (error) {
    logger.error("Error dduring blog creation.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default createBlog