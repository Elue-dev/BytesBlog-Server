import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { AuthenticatedRequest } from "../models/types/auth";

const AUTHOR_FIELDS = {
  id: true,
  avatar: true,
  firstName: true,
  lastName: true,
};

export const getComments = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: AUTHOR_FIELDS,
        },
        children: {
          include: {
            author: {
              select: AUTHOR_FIELDS,
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      comments,
    });
  }
);

export const getCommentsById = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await prisma.comment.findMany({
      where: {
        id: req.params.commentId,
      },
      include: {
        author: {
          select: AUTHOR_FIELDS,
        },
        children: {
          include: {
            author: {
              select: AUTHOR_FIELDS,
            },
            children: {
              include: {
                author: {
                  select: AUTHOR_FIELDS,
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      comments,
    });
  }
);

export const getPostComments = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await prisma.comment.findMany({
      where: {
        postId: req.params.postId,
      },
      include: {
        author: {
          select: AUTHOR_FIELDS,
        },
        children: {
          include: {
            author: {
              select: AUTHOR_FIELDS,
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      comments,
    });
  }
);

export const addComment = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { message, parentId, postId } = req.body;

    let missingFields = [];
    let bodyObject = { message, postId };

    for (let field in bodyObject) {
      if (!req.body[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return next(
        new AppError(
          `comment ${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } required`,
          400
        )
      );

    const comment = await prisma.comment.create({
      data: {
        message,
        authorId: req.user?.id!,
        parentId,
        postId,
      },
    });

    res.status(200).json({
      status: "success",
      comment,
    });
  }
);
