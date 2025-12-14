import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response, NextFunction } from "express";


export type AuthRole = 'admin' | 'user';


/**
 * Middleware de orden superior para la autorización basada en roles.
 * Recibe un array de roles permitidos y verifica si el usuario autenticado (a través de `req.userId`) tiene uno de esos roles.
 * Si el usuario no se encuentra o no tiene el rol adecuado, envía una respuesta de error 401 o 403.
 */
const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        res.status(401).json({
          code: "NotFound",
          message: 'User not found'
        })
        return
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          code: "AuthorizarionError",
          message: 'Acces denied, insufficient permissions'
        })
        return
      }

      return next();

    } catch (error) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal server error"
      });

      logger.error("Error during authorization.", error);
    }
  }
};


export default authorize;
