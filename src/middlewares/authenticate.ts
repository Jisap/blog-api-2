import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose"


// Middleware para verificar el token de acceso del usuario logueado insertado en los headers.
// Si el token es válido el userId is añadido al objeto de la request (solicitud)
// En caso contrario se envía un error 401

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization; // Obtenemos el token de acceso del header de la solicitud

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "AuthenticationError",
      message: "Access denied, no token provided"
    })
    return;
  }

  const [_, token] = authHeader.split(" ")

  try {

    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId }; // Verficamos el token que contiene el userId
    req.userId = jwtPayload.userId;                                            // Añadimos el userId al objeto de la request (solicitud)
    return next();                                                             // Continuamos con el siguiente middleware 

  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token"
      })
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid access token",
      })
      return;
    }

    res.status(500).json({
      code: "AuthenticationError",
      message: "Internal server error",
      error: error
    })
    logger.error("Error during authentication.", error)
  }
}

export default authenticate;