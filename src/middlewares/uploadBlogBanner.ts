

import uploadToCloudinary from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import Blog from "@/models/Blog";
import type { Request, Response, NextFunction } from "express";
import type { UploadApiErrorResponse } from "cloudinary";


const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2Mb


const uploadBlogBanner = (method: "post" | "put") => {                           // Recibe el metodo post o put
  return async (req: Request, res: Response, next: NextFunction) => {

    // put y no hay archivo de imagen nueva 
    // -> saltar la lógica de subida de imagen
    if (method === "put" && !req.file) {                                         // Si el metodo es put y no hay archivo de imagen nueva se salta la lógica de subida de imagen
      next();                                                                    // De lo que se trata es de actualizar el resto del content pero no la imagen
      return;
    }

    // post y no hay archivo de imagen nueva -> error
    if (!req.file) {                                                             // Encaso de que estemos en el método post y no haya archivo de imagen nueva -> error
      res.status(400).json({
        code: "ValidationError",
        message: "Banner image is required"
      });
      return
    }

    // post y el archivo de imagen es mayor a 2MB -> error
    if (req.file.size > MAX_FILE_SIZE) {                                         // Si si existe el archivo de imagen pero es mayor a 2MB -> error
      res.status(413).json({
        code: "ValidationError",
        message: "Banner image size should be less than 2MB"
      });
      return;
    }

    // put o post con archivo de imagen ok -> subir a cloudinary
    try {
      const { blogId } = req.params;                                             // Id del blog que se quiere actualizar 
      const blog = await Blog.findById(blogId).select("banner.publicId").exec(); // Busca el blog por id y selecciona el publicId de la imagen

      const data = await uploadToCloudinary(                                     // Si tenemos el archivo de imagen y cumple los requisitos -> subimos a cloudinary
        req.file.buffer,
        blog?.banner.publicId.replace("blog-api", "")
      )

      if (!data) {
        res.status(500).json({
          code: "ServerError",
          message: "Internal server error"
        });

        logger.error("Error while uploading blog banner to cloudinary", {
          blogId,
          publicId: blog?.banner.publicId,
        });
        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      }

      logger.info("Blog banner uploaded successfully", {
        blogId,
        banner: newBanner
      });

      req.body.banner = newBanner;

      next();

    } catch (error: UploadApiErrorResponse | any) {
      res.status(error.http_code).json({
        code: error.http_code < 500 ? "ValidationError" : error.name,
        message: error.message
      })
    }
  }
}

export default uploadBlogBanner;



