import { logger } from "@/lib/winston";
import Blog from "@/models/Blog";
import User from "@/models/user";
import type { Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary';



const deleteUser = async (req: Request, res: Response) => {


  try {
    const userId = req.params.userId;

    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);

    await cloudinary.api.delete_resources(publicIds);                  // Elimina las imágenes de los blogs del usuario
    logger.info('Multiple blog banners deleted from cloudinary')

    await Blog.deleteMany({ author: userId });                         // Elimina los blogs del usuario
    logger.info('Multiple blogs deleted from the database')

    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {  // deleteOne devuelve un objeto con el resultado de la operación (ej. { deletedCount: 1 }).
      return res.status(404).json({   // En este caso si el deletedCount es 0, significa que no se encontró ningún documento con el ID proporcionado.
        code: "NotFound",
        message: "User not found",
      });
    }

    logger.info("A user account has been deleted", { userId });

    res.sendStatus(204);

  } catch (error) {
    logger.error("Error while deleting a user account.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

  }
}


export default deleteUser
