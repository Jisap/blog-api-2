import { Router } from "express";
import register from "@/controllers/v1/auth/register";
import { body } from "express-validator";
import validationError from "@/middlewares/validationError";
import User from "@/models/user";


const router = Router();

router.post(
  '/register',
  body('email') // validate email con express-validator
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters long')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('User Email or Password is invalid');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user')
    .default('user'),
  validationError,
  register
)

export default router;