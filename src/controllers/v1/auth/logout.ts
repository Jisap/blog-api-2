import { logger } from "@/lib/winston";
import Token from "@/models/token";
import type { Request, Response } from "express";
import config from "@/config";


const logout = async (req: Request, res: Response): Promise<void> => {


  try {

    const refreshToken = req.cookies.refreshToken as string;        // Obtenemos el refreshToken de la cookie del usuario logueado

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });               // Eliminamos el refreshToken de la base de datos
      logger.info("User refresh token deleted succesfully", {
        userId: req.userId,
        token: refreshToken
      })
    }

    res.clearCookie('refreshToken', {                                // Eliminamos la cookie del refreshToken   
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.sendStatus(204)

    logger.info('User logged out successfully.', {
      userId: req.userId
    })


  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during user logout.', error)
  }

}

export default logout;

