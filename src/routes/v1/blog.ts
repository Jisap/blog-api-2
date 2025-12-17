import createBlog from "@/controllers/v1/blog/create_blog";
import deleteCurrentUser from "@/controllers/v1/user/delete_current_user";
import deleteUser from "@/controllers/v1/user/delete_user";
import getAllUser from "@/controllers/v1/user/get_all_user";
import getCurrentUser from "@/controllers/v1/user/get_current_user";
import getUser from "@/controllers/v1/user/get_user";
import updateCurrentUser from "@/controllers/v1/user/update_current_user";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import user from "@/models/user";
import { Router } from "express";
import { body, param, query } from "express-validator";



const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['user', 'admin']),
  createBlog
);


export default router;
