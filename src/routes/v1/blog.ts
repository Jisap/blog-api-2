import createBlog from "@/controllers/v1/blog/create_blog";
import getAllBlogs from "@/controllers/v1/blog/get_all_blogs";
import getBlogBySlug from "@/controllers/v1/blog/get_blog_by_slug";
import getBlogsByUser from "@/controllers/v1/blog/get_blogs_by_user";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";
import validationError from "@/middlewares/validationError";
import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from "multer";



const upload = multer();

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['admin']),
  upload.single("banner_image"), // multer guarda en el buffer la imagen y se la pasa al middleware uploadBlogBanner
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
  uploadBlogBanner("post"),      // uploadBlogBanner es un middleware que sube la imagen a cloudinary
  createBlog
);

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getAllBlogs
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin']),
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getBlogsByUser
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  param('slug')
    .notEmpty()
    .withMessage('Slug is required'),
  validationError,
  getBlogBySlug
)


export default router;
