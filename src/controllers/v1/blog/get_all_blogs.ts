import { logger } from "@/lib/winston";
import Blog from "@/models/Blog";
import User from "@/models/user";
import config from "@/config";
import type { Request, Response } from "express";



interface QueryType {
  status?: "draft" | "published"
};



const getAllBlogs = async (req: Request, res: Response) => {

  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;


    const user = await User
      .findById(userId)
      .select("role")
      .lean()
      .exec()

    const query: QueryType = {};

    // los usuarios normales solo verán las publicaciones que han sido marcadas como "publicadas".
    if (user?.role === "user") {
      query.status = "published"
    }

    const total = await Blog.countDocuments(query);         // Cuenta el número total de publicaciones que coinciden con el query 
    const blogs = await Blog.find(query)                    // Busca todas las publicaciones que coincidan con el query
      .select('-banner.publicId -__v')                      // Se excluye el campo publicId de la imagen y el campo __v de la base de datos
      .populate('author', '-createdAt -updatedAt -__v')     // Se excluye el campo createdAt, updatedAt y __v del autor
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    return res.status(200).json({
      blogs,
      total,
      limit,
      offset
    })

  } catch (error) {
    logger.error('Error while fetching all blogs.', error)
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

  }
};

export default getAllBlogs;