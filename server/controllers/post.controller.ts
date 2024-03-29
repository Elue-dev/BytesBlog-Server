import { Prisma } from "@prisma/client";
import { NextFunction, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { slugify } from "../helpers/slugify";
import { AuthenticatedRequest } from "../models/types/auth";
import {
  AUTHOR_FIELDS,
  AUTHOR_FIELDS_LONGER,
  LIKE_FIELDS,
} from "../utils/fields";

export const addPost = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, content, image, readTime, categories } = req.body;

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
        categories,
        slug: slugify(title),
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
  async (req: AuthenticatedRequest, res: Response) => {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: AUTHOR_FIELDS_LONGER,
        },
        likes: {
          include: {
            user: {
              select: LIKE_FIELDS,
            },
          },
        },
        bookmarks: true,
        comments: true,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
    });

    res.status(200).json({
      status: "success",
      posts,
    });
  }
);

export const getSinglePost = handleAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const post = await prisma.post.findFirst({
      where: {
        AND: [{ slug: req.params.slug }, { id: req.params.postId }],
      },
      include: {
        author: {
          select: AUTHOR_FIELDS_LONGER,
        },
        bookmarks: {
          include: {
            user: {
              select: AUTHOR_FIELDS,
            },
          },
        },
        comments: {
          include: {
            author: {
              select: AUTHOR_FIELDS,
            },
          },
        },
        likes: {
          include: {
            user: {
              select: AUTHOR_FIELDS_LONGER,
            },
          },
        },
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
    const { title, content, image, readTime, categories } = req.body;

    if (!title && !content && !image && !readTime)
      return next(
        new AppError(
          "Please provide at least one detail you want to update",
          400
        )
      );

    const post = await prisma.post.findFirst({
      where: {
        AND: [{ slug: req.params.slug }, { id: req.params.postId }],
      },
    });

    if (!post) return next(new AppError("Post could not be found", 404));

    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        title: title || post.title,
        slug: title ? slugify(title) : post.slug,
        content: content || post.content,
        image: image || post.image,
        categories: categories || post.categories,
        readTime: readTime || post.readTime,
      },
    });

    res.status(200).json({
      status: "success",
      updatedPost,
    });
  }
);
