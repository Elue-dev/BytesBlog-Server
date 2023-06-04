import { NextFunction, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { AuthenticatedRequest } from "../models/types/auth";

export const addPost = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, content, image, readTime, authorId } = req.body;

    let missingFields = [];
    let bodyObject = { title, content, image, readTime };

    for (let field in bodyObject) {
      if (!req.body[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return next(
        new AppError(
          `post ${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } required`,
          400
        )
      );

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image,
        readTime,
        authorId: req.user?.id!,
      },
    });

    res.status(200).json({
      status: "success",
      post,
    });
  }
);

export const getPosts = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      posts,
    });
  }
);

export const getSinglePost = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const post = await prisma.post.findMany({
      where: {
        id: req.params.postId,
      },
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        bookmarks: true,
        comments: true,
        likes: true,
      },
    });

    res.status(200).json({
      status: "success",
      post,
    });
  }
);

export const updatePost = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      posts,
    });
  }
);
