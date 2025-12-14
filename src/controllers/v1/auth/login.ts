import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import Token from "@/models/token";
import User from "@/models/user";
import config from "@/config";
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';


type UserData = Pick<IUser, 'email' | 'password' | 'role'>;


const login = async (req: Request, res: Response): Promise<void> => {

  const { email } = req.body as UserData;                                           // Desestructuramos del body de la solicitud el email

  try {

    const user = await User.findOne({ email })                                      // Buscamos el usuario en la base de datos
      .select('username email password role')
      .lean()
      .exec()

    if (!user) {                                                                    // Si no se encuentra el usuario -> error 404
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found'
      })
      return;
    }

    const accessToken = generateAccessToken(user._id);                             // Generamos el accessToken
    const refreshToken = generateRefreshToken(user._id);                           // Generamos el refreshToken

    await Token.create({                                                           // Guardamos el refreshToken en la base de datos
      token: refreshToken,
      userId: user._id
    });
    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken
    })

    res.cookie('refreshToken', refreshToken, {                                      // cookie en en los headers de la respuesta con el refreshToken
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.status(201).json({                                                          // user y accessToken en la respuesta de la solicitud
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken
    });

    logger.info('User logged in successfully.', user)

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during user registration.', error)
  }

}

export default login;

