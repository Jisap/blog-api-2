import { Router } from 'express';
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/users';
import blogRoutes from '@/routes/v1/blog';
import likeRoutes from '@/routes/v1/like';



const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "API is live",
    status: 'ok',
    version: '1.0.0',
    docs: 'https://docs.blog-api.codewithsadee.com',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes);

export default router;