import { logger } from "@/lib/winston";
import Blog from "@/models/Blog";
import User from "@/models/user";
import config from "@/config";
import type { Request, Response } from "express";



interface QueryType {
  status?: "draft" | "published"
};



const getBlogsByUser = async (req: Request, res: Response) => {

  try {
    const userId = req.params.userId; // Usuario al que le pertenecen las publicaciones
    const currentUserId = req.userId; // Usuario que está haciendo la petición
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;


    const currentUser = await User // Busca el usuario que está haciendo la petición
      .findById(currentUserId)
      .select("role")
      .lean()
      .exec()

    const query: QueryType = {};

    // Definimos el query para que los usuarios normales solo vean las publicaciones que han sido marcadas como "publicadas".
    if (currentUser?.role === "user") {
      query.status = "published"
    }

    const total = await Blog.countDocuments({               // Cuenta el número total de publicaciones que coinciden con el query 
      author: userId,
      ...query,
    });

    const blogs = await Blog.find({                         // Busca todas las publicaciones que coincidan con el query
      author: userId,
      ...query
    })
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
    logger.error('Error while fetching blogs by user.', error)
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

  }
};

export default getBlogsByUser