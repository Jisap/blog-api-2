import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "@/lib/winston";
import Token from "@/models/token";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { verifyRefreshToken, verifyAccessToken, generateAccessToken } from "@/lib/jwt";



const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;                                    // Obtenemos el token de refresco desde las cookies

  if (!refreshToken) {
    res.status(401).json({
      code: 'Unauthorized',
      message: 'Refresh token not found'
    })
    return;
  }

  try {

    const tokenExists = await Token.exists({ token: refreshToken });                           // Verificamos si el token de refresco existe en la base de datos

    if (!tokenExists) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token'
      })
      return;
    }

    const jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId };          // Verificamosla validez del token de refresco y obtenemos el payload (userId)

    const accessToken = generateAccessToken(jwtPayload.userId);                                 // Generamos el accessToken con el userId recien obtenido

    res.status(200).json({                                                                      // Devolvemos el accessToken
      accessToken
    });

  } catch (error) {

    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again'
      })
      return
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token"
      })
      return
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error during refresh token.', error)
  }
}

export default refreshToken;
