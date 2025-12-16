import getCurrentUser from "@/controllers/v1/user/get_current_user";
import updateCurrentUser from "@/controllers/v1/user/update_current_user";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import user from "@/models/user";
import { Router } from "express";
import { body, param, query } from "express-validator";



const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(['user', 'admin']),
  getCurrentUser
);

router.put(
  '/current',
  authenticate,
  authorize(['user', 'admin']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 characters long')
    .custom(async (value) => {
      const userExists = await user.exists({ username: value });
      if (userExists) {
        throw new Error('this username is already in use');
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters long')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await user.exists({ email: value });
      if (userExists) {
        throw new Error('this email is already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('first_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less than 20 characters long'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Last name must be less than 20 characters long'),
  body(['website', 'facebook', 'x', 'instagram', 'linkedin', 'youtube'])
    .optional()
    .isURL()
    .withMessage('Invalid URL')
    .isLength({ max: 100 })
    .withMessage('URL must be less than 100 characters long'),
  validationError,
  updateCurrentUser
)

export default router;
