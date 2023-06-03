import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { LoginPayload, SignUpPayload } from "../models/types/auth";
import CryptoJS from "crypto-js";
import { User } from "../models/types/user";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, lastname, email, password, interests }: SignUpPayload =
      req.body;

    let missingFields = [];
    let bodyObject = { firstname, lastname, email, password, interests };

    for (let field in bodyObject) {
      if (!req.body[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return next(
        new AppError(
          `user ${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } required`,
          400
        )
      );

    const userExists = await prisma.user.findFirst({ where: { email } });
    if (userExists) return next(new AppError("Email already in use", 400));

    const passwordHash = CryptoJS.AES.encrypt(
      password,
      process.env.SECRET_KEY as string
    ).toString();

    const newUser = await prisma.user.create({
      data: {
        firstName: firstname,
        lastName: lastname,
        email,
        password: passwordHash,
        avatar: "",
        interests,
        bio: "",
      },
    });

    res.status(201).json({
      status: "success",
      user: newUser,
      message: "User created.",
    });
  }
);

export const login = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: LoginPayload = req.body;

    let missingFields = [];
    let bodyObject = { email, password };

    for (let field in bodyObject) {
      if (!req.body[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return next(
        new AppError(
          `user ${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } required`,
          400
        )
      );

    const user: User | null = await prisma.user.findFirst({ where: { email } });
    if (!user) return next(new AppError("Invalid credentials provided", 400));

    const bytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY as string
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password)
      return next(new AppError("Invalid credentials provided", 400));

    res.status(201).json({
      status: "success",
      user,
    });
  }
);
