import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";

import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { generateToken } from "../helpers/generate.token";
import { AuthenticatedRequest } from "../models/types/auth";

export const getUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({});
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
      include: {
        posts: true,
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
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { firstName, lastName, avatar, bio, interests } = req.body;

    if (!firstName && !lastName && !avatar && !bio && !interests)
      return next(
        new AppError(
          "Please provide at least one credential you want to update",
          400
        )
      );

    const existingUser = await prisma.user.findFirst({
      where: {
        id: req.user?.id,
      },
    });

    if (!existingUser)
      return next(new AppError("User could not be found", 404));

    const user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        avatar: avatar || existingUser.avatar,
        bio: bio || existingUser.bio,
        interests: interests || existingUser.interests,
      },
    });

    const token = generateToken(existingUser.id);
    const { password: _password, ...userWithoutPassword } = user;
    const updatedUser = { token, ...userWithoutPassword };

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);
