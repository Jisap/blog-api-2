import { logger } from "@/lib/winston";
import config from "@/config";
import type { Request, Response } from 'express';
import type { IUser } from "@/models/user";
import { genUsername } from "@/utils";
import User from "@/models/user";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";



type UserData = Pick<IUser, 'email' | 'password' | 'role'>


const register = async (req: Request, res: Response): Promise<void> => {

  const { email, password, role } = req.body as UserData;

  try {
    const username = genUsername(email);

    const newUser = await User.create({
      username,
      email,
      password,
      role
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    res.cookie('refreshToken', refreshToken, { // cookie en en los headers de la respuesta
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.status(201).json({ // user y accessToken en la respuesta de la solicitud
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