import { Bookmark } from "@prisma/client";
import { NextFunction, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { AuthenticatedRequest } from "../models/types/auth";
import { AUTHOR_FIELDS } from "../utils/author.fields";

export const addRemoveBookmark = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    if (!postId)
      return next(new AppError("Please provide the id of the post", 400));

    const postToBookmark = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        bookmarks: true,
      },
    });

    if (!postToBookmark)
      return next(new AppError("Post could not be found", 400));

    const userHasBookmarked = postToBookmark?.bookmarks?.find(
      (bookmark: Bookmark) => bookmark.userId === req.user?.id
    );

    if (userHasBookmarked) {
      await prisma.bookmark.deleteMany({
        where: {
          userId: req.user?.id!,
          postId,
        },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: req.user?.id!,
          postId,
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: userHasBookmarked
        ? "Post removed from bookmarks"
        : "Post added to bookmarks",
    });
  }
);

export const getBookmarks = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("user", req.user);

    const userBookmarks = await prisma.bookmark.findMany({
      include: {
        post: {
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
      bookmarks: userBookmarks,
    });
  }
);
