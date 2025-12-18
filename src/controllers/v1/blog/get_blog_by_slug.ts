import { logger } from "@/lib/winston";
import Blog from "@/models/Blog";
import User from "@/models/user";
import config from "@/config";
import type { Request, Response } from "express";



interface QueryType {
  status?: "draft" | "published"
};



const getBlogBySlug = async (req: Request, res: Response) => {

  try {
    const userId = req.userId;     // Usuario que está haciendo la petición
    const slug = req.params.slug;  // Slug de la publicación

    const user = await User        // Busca el usuario que está haciendo la petición
      .findById(userId)
      .select("role")
      .lean()
      .exec()


    const blog = await Blog.findOne({                       // Busca la publicación por slug
      slug
    })
      .select('-banner.publicId -__v')                      // Se excluye el campo publicId de la imagen y el campo __v de la base de datos
      .populate('author', '-createdAt -updatedAt -__v')     // Se excluye el campo createdAt, updatedAt y __v del autor
      .lean()
      .exec()

    if (!blog) {
      res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
      return
    }

    // Si el usuario es un usuario normal y la publicación está marcada como "draft", no se le muestra la publicación.
    if (user?.role === "user" && blog.status === "draft") {
      res.status(403).json({
        code: "Forbidden",
        message: "Access denied, insufficient permissions."
      });

      logger.warn("A user tried to access to access a draft blog.", {
        userId,
        blog
      })
      return
    }

    return res.status(200).json({
      blog
    })

  } catch (error) {
    logger.error('Error while fetching blogs by user.', error)
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

  }
};

export default getBlogBySlug