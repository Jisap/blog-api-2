import { logger } from "@/lib/winston";
import User from "@/models/user";
import Blog from "@/models/Blog";
import type { Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary';



const deleteCurrentUser = async (req: Request, res: Response) => {     // Ideal para que el usuario pueda eliminar su propia cuenta
  const userId = req.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);

    await cloudinary.api.delete_resources(publicIds);                  // Elimina las imágenes de los blogs del usuario
    logger.info('Multiple blog banners deleted from cloudinary')

    await Blog.deleteMany({ author: userId });                         // Elimina los blogs del usuario
    logger.info('Multiple blogs deleted from the database')

    await User.deleteOne({ _id: userId });                             // Elimina la cuenta del usuario
    logger.info("A user account has been deleted.", {
      userId,
      blogs
    });

    res.sendStatus(204)

  } catch (error) {
    logger.error("Error deleting user.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
};

export default deleteCurrentUser;


