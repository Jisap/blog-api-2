import { logger } from "@/lib/winston";
import User from "@/models/user";
import config from "@/config";
import type { Request, Response } from "express";



const getAllUser = async (req: Request, res: Response) => {

  try {
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .lean()
      .exec()

    return res.status(200).json({
      users,
      total,
      limit,
      offset
    })

  } catch (error) {
    logger.error('Error getting all users.', error)
    return res.status(500).json({
      code: "ServerError",
      message: "Internal server error"
    });

  }
};

export default getAllUser;
