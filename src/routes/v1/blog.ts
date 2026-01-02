import createBlog from "@/controllers/v1/blog/create_blog";
import deleteBlog from "@/controllers/v1/blog/delete_blog";
import getAllBlogs from "@/controllers/v1/blog/get_all_blogs";
import getBlogBySlug from "@/controllers/v1/blog/get_blog_by_slug";
import getBlogsByUser from "@/controllers/v1/blog/get_blogs_by_user";
import updateBlog from "@/controllers/v1/blog/update_blog";
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

router.get(
  '/',
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



router.put(
  '/:blogId',
  authenticate,
  //authorize(['admin']),
  upload.single('banner_image'),
  param('blogId')
    .trim()
    .isMongoId()
    .withMessage('Invalid blog ID'),
  body('title')
    .optional()
    .isLength({ max: 180 })
    .withMessage('Title must be less than 180 characters'),
  body('content')
    .optional(),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be "draft" or "published"'),
  uploadBlogBanner('put'),
  validationError,
  updateBlog
);

router.get(
  '/:slug',
  param('slug')
    .notEmpty()
    .withMessage('Slug is required'),
  validationError,
  getBlogBySlug
);

router.delete(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  param('blogId')
    .isMongoId()
    .withMessage('Invalid blog ID'),
  validationError,
  deleteBlog
);


export default router;
