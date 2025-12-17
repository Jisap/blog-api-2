import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";




const deleteUser = async (req: Request, res: Response) => {


  try {
    const userId = req.params.userId;

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
