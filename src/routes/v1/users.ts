import getCurrentUser from "@/controllers/v1/user/get_current_user";
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

export default router;
