import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";

import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";

export const getUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany();
    res.status(200).json({
      status: "success",
      users,
    });
  }
);

export const getSingleUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
      },
    });
    if (!user) return next(new AppError("User could not be found", 404));
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const updateUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, avatar, bio, interests } = req.body;

    if (!firstName && !lastName && !avatar && !bio && !interests)
      return next(
        new AppError(
          "Please provide at least one credential you want to update",
          404
        )
      );

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.userId,
      },
    });

    if (!user) return next(new AppError("User could not be found", 404));

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        avatar: avatar || user.avatar,
        bio: bio || user.bio,
        interests: interests || user.interests,
      },
    });

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);
