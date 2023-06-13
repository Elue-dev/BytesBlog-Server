import { Like } from "@prisma/client";
import { NextFunction, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { AuthenticatedRequest } from "../models/types/auth";

export const likeDislikePost = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    if (!postId)
      return next(new AppError("Please provide the id of the post", 400));

    const postToLike = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        likes: true,
      },
    });

    if (!postToLike) return next(new AppError("Post could not be found", 400));

    const userHasLiked = postToLike?.likes?.find(
      (like: Like) => like.userId === req.user?.id
    );

    if (userHasLiked) {
      await prisma.like.deleteMany({
        where: {
          userId: req.user?.id!,
          postId,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          type: "post",
          userId: req.user?.id!,
          postId,
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: userHasLiked ? "Post Unliked" : "Post liked",
    });
  }
);

export const likeDislikeComment = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { commentId } = req.params;

    if (!commentId)
      return next(new AppError("Please provide the id of the post", 400));

    const commentToLike = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
      include: {
        likes: true,
      },
    });

    if (!commentToLike)
      return next(new AppError("Post could not be found", 400));

    const userHasCommented = commentToLike?.likes?.find(
      (like: Like) => like.userId === req.user?.id
    );

    if (userHasCommented) {
      await prisma.like.deleteMany({
        where: {
          userId: req.user?.id!,
          commentId,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          type: "post",
          userId: req.user?.id!,
          commentId,
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: userHasCommented ? "Comment Unliked" : "Comment liked",
    });
  }
);
