import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { LoginPayload, SignUpPayload } from "../models/types/auth";
import CryptoJS from "crypto-js";
import { User } from "../models/types/user";
import { generateToken } from "../lib/generate.token";
import { welcome } from "../views/welcome.email";
import sendEmail from "../services/email.service";
import { createHash, randomBytes } from "crypto";
import { passwordResetEmail } from "../views/reset.email";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstname,
      lastname,
      email,
      password,
      interests,
      avatar,
    }: SignUpPayload = req.body;

    let missingFields = [];
    let bodyObject = {
      firstname,
      lastname,
      email,
      password,
      interests,
    };

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

    const newUser: User = await prisma.user.create({
      data: {
        firstName: firstname,
        lastName: lastname,
        email,
        password: passwordHash,
        avatar: avatar || "",
        interests,
        bio: "",
      },
    });

    const subject = `Welcome Onboard, ${newUser.firstName}!`;
    const send_to = newUser.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = welcome(newUser.lastName);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(201).json({
        status: "success",
        message: "User created.",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Something went wrong. Please try again.`,
      });
    }
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

    const token = generateToken(user.id);
    const { password: _password, ...userWithoutPassword } = user;

    const userInfo = { token, ...userWithoutPassword };

    res.status(200).json({
      status: "success",
      user: userInfo,
    });
  }
);

export const googleLogin = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user: User | null = await prisma.user.findFirst({ where: { email } });
    if (!user) return next(new AppError("User not found", 400));

    const token = generateToken(user.id);
    const { password: _password, ...userWithoutPassword } = user;

    const userInfo = { token, ...userWithoutPassword };

    res.status(200).json({
      status: "success",
      user: userInfo,
    });
  }
);

export const forgotPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email)
      return next(
        new AppError(
          "Please provide the email associated with your account",
          400
        )
      );

    const user: User | null = await prisma.user.findFirst({ where: { email } });
    if (!user)
      return next(new AppError("The email provided is not registered", 404));

    const resetToken = randomBytes(32).toString("hex") + user.id;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    await prisma.token.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    const subject = `Password Reset Request`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      username: user.firstName,
      url: resetUrl,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `An email has been sent to ${email} with instructions
        to reset your password`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);
