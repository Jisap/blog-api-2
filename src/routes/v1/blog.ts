import createBlog from "@/controllers/v1/blog/create_blog";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";
import validationError from "@/middlewares/validationError";
import user from "@/models/user";
import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from "multer";



const upload = multer();

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['user', 'admin']),
  upload.single("banner_image"), // multer guarda en el buffer la imagen y se la pasa al middleware uploadBlogBanner
  uploadBlogBanner("post"),      // uploadBlogBanner es un middleware que sube la imagen a cloudinary
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be 'draft' or 'published'"),
  validationError,
  createBlog
);


export default router;
