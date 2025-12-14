import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";




const getCurrentUser = async (req: Request, res: Response) => {


  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    res.status(200).json({
      code: "Success",
      message: "User found",
      data: user
    })

  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

    logger.error("Error while getting current user.", error);
  }
}


export default getCurrentUser
