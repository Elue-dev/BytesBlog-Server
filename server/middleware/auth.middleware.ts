import { Request, Response, NextFunction } from "express";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/types/user";
import prisma from "../db/prisma.client";
import { AuthenticatedRequest } from "../models/types/auth";

export const verifyAuth = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const headers = req.headers.authorization;
    if (headers && headers.startsWith("Bearer")) token = headers.split(" ")[1];
    if (!token)
      return next(
        new AppError("You are not logged in. Please login to get access", 400)
      );

    try {
      const verifiedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const currentUser: User | null = await prisma.user.findFirst({
        where: { id: verifiedToken.id },
      });
      (req as AuthenticatedRequest).user = currentUser;
    } catch (error) {
      return next(new AppError("Session expired. Please log in again", 401));
    }

    next();
  }
);
