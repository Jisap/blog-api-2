import { logger } from "@/lib/winston";
import config from "@/config";
import type { Request, Response } from 'express';
import type { IUser } from "@/models/user";
import { genUsername } from "@/utils";
import User from "@/models/user";
import Token from "@/models/token";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";



type UserData = Pick<IUser, 'email' | 'password' | 'role'>


const register = async (req: Request, res: Response): Promise<void> => {

  const { email, password, role } = req.body as UserData;                            // Desestructuramos el body de la solicitud

  if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {           // Si el rol es admin y el email no está en la lista blanca
    res.status(403).json({
      code: 'AuthorizationError',
      message: ' you cannot register as an admin'
    })
    logger.warn(
      `User with email ${email} is trying to register as an admin but is not in the whitelist`
    );
    return;
  }


  try {
    const username = genUsername(email);                                             // Generamos el username

    const newUser = await User.create({                                              // Creamos el nuevo usuario en la base de datos
      username,
      email,
      password,
      role
    });

    const accessToken = generateAccessToken(newUser._id);                             // Generamos el accessToken
    const refreshToken = generateRefreshToken(newUser._id);                           // Generamos el refreshToken

    await Token.create({                                                              // Guardamos el refreshToken en la base de datos
      token: refreshToken,
      userId: newUser._id
    });
    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken
    })

    res.cookie('refreshToken', refreshToken, {                                        // cookie en en los headers de la respuesta con el refreshToken
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.status(201).json({                                                            // user y accessToken en la respuesta de la solicitud
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken
    });

    logger.info('User registered successfully.', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    })

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during user registration.', error)
  }
}

export default register