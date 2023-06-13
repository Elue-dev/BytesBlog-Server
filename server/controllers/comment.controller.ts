import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { AuthenticatedRequest } from "../models/types/auth";
import sendEmail from "../services/email.service";
import { AUTHOR_FIELDS_LONGER } from "../utils/fields";
import { commentEmail } from "../views/comment.email";
import { emailReply } from "../views/reply.email";

const AUTHOR_FIELDS = {
  id: true,
  avatar: true,
  firstName: true,
  lastName: true,
  email: true,
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
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
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
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
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
          select: AUTHOR_FIELDS_LONGER,
        },

        children: {
          include: {
            author: {
              select: AUTHOR_FIELDS,
            },
          },
        },
        post: {
          include: {
            author: {
              select: {
                email: true,
              },
            },
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
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
    const { message, parentId, postId, authorEmail, path, isReplying } =
      req.body;

    let missingFields = [];
    let bodyObject = { message, postId, authorEmail, path };

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
        parentId: parentId,
        postId,
      },
    });

    const commentAuthor = await prisma.user.findFirst({
      where: {
        email: authorEmail,
      },
    });

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: AUTHOR_FIELDS,
        },
      },
    });

    const replySubject = `New Reply on your comment`;
    const reply_send_to = authorEmail;
    const commentSubject = `New Comment on your post`;
    const comment_send_to = authorEmail;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const replyBody = emailReply(post?.author.firstName!, path, message);
    const commentBody = commentEmail(commentAuthor?.firstName!, path, message);

    try {
      if (authorEmail !== req.user?.email) {
        sendEmail({
          subject: isReplying ? replySubject : commentSubject,
          body: isReplying ? replyBody : commentBody,
          send_to: isReplying ? reply_send_to : comment_send_to,
          sent_from,
          reply_to,
        });
      }

      res.status(200).json({
        status: "success",
        comment,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Something went wrong. Please try again.`,
      });
    }
  }
);
