import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';
import Blog from '@/models/Blog';
import User from '@/models/user';;
import Comment from '@/models/comment';
import type { IComment } from '@/models/comment';



const deleteComment = async (req: Request, res: Response) => {

  const currentUserId = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId).select('userId blogId').lean().exec();
    const user = await User.findById(currentUserId).select('role').lean().exec();


    if (!comment) {
      return res.status(404).json({
        code: "CommentNotFound",
        message: "Comment not found"
      });
    }

    const blog = await Blog.findById(comment?.blogId).select('commentsCount').exec();
    if (!blog) {
      res.status(404).json({
        code: "BlogNotFound",
        message: "Blog not found"
      });
      return;
    }

    if (comment.userId !== currentUserId && user?.role !== 'admin') {
      res.status(403).json({
        code: "AuthorizationError",
        message: "You are not authorized to delete this comment"
      });

      logger.warn('A user tried to delete a comment wihtout permission', {
        userId: currentUserId,
        comment
      })
      return;
    }

    await Comment.deleteOne({ _id: commentId });

    logger.info('Comment deleted successfully', {
      commentId
    });

    blog.commentsCount--;
    await blog.save();

    logger.info('Blog comments count updated.', {
      blogId: blog._id,
      commentsCount: blog.commentsCount
    })

    return res.status(200).json({
      code: "Success",
      message: "Comment deleted successfully"
    });

  } catch (error) {
    logger.error("Error while deleting comment.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
}

export default deleteComment