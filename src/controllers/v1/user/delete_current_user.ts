import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";


const deleteCurrentUser = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    await User.deleteOne({ _id: userId });
    logger.info("A user account has been deleted.", userId);
    res.sendStatus(204)
  } catch (error) {
    logger.error("Error deleting user.", error);
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });
  }
};

export default deleteCurrentUser;


