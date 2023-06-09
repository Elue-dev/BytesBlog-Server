import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";
import handleAsync from "../helpers/async.handler";
import { AppError } from "../helpers/global.error";
import { LoginPayload, SignUpPayload } from "../models/types/auth";
import { User } from "../models/types/user";
import { generateToken } from "../helpers/generate.token";
import { welcome } from "../views/welcome.email";
import sendEmail from "../services/email.service";
import { createHash, randomBytes } from "crypto";
import parser from "ua-parser-js";
import { passwordResetEmail } from "../views/reset.email";
import { resetSuccess } from "../views/reset.success.email";
import { compare, genSaltSync, hashSync } from "bcryptjs";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstname,
      lastname,
      email,
      password,
      interests,
      avatar,
      withGoogle,
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
    if (userExists && userExists.withGoogle)
      return next(
        new AppError(
          "Account has already been signed up with google, sign in instead",
          400
        )
      );

    if (userExists) return next(new AppError("Email already in use", 400));

    const salt = genSaltSync(10);
    const passwordHash = hashSync(password, salt);

    const newUser: User = await prisma.user.create({
      data: {
        firstName: firstname,
        lastName: lastname,
        email,
        password: passwordHash,
        avatar: avatar || "",
        interests,
        bio: "",
        withGoogle,
      },
    });

    const subject = `Welcome Onboard, ${newUser.firstName}!`;
    const send_to = newUser.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = welcome(newUser.lastName);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      const token = generateToken(newUser.id);
      const { password: _password, ...userWithoutPassword } = newUser;
      const userInfo = { token, ...userWithoutPassword };
      res.status(200).json({
        status: "success",
        user: userInfo,
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

    const passwordIscorrect = await compare(password, user.password);

    if (!passwordIscorrect)
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
    if (!user)
      return next(
        new AppError("User not registered. Sign up with google first", 404)
      );

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

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}?withGoogle=${user.withGoogle}`;

    const subject = user.withGoogle
      ? "Password creation for your google account"
      : "Password Reset Request";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      username: user.firstName,
      url: resetUrl,
      withGoogle: user.withGoogle,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        withGoogle: user.withGoogle,
        message: user.withGoogle
          ? `An email has been sent to ${email} with instructions
        to create a password for your google account`
          : `An email has been sent to ${email} with instructions
        to reset your password. Please ensure to check your spam folder, Click on 'Report as not spam' so you can keep getting our emails in your inbox`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const resetPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, confirmNewPassword } = req.body;
    const { token } = req.params;

    if (!newPassword || !confirmNewPassword)
      return next(new AppError("Please provide all password credentials", 400));

    if (newPassword !== confirmNewPassword)
      return next(new AppError("New password credentials do not match", 400));

    const decryptedToken = createHash("sha256").update(token).digest("hex");
    const existingToken = await prisma.token.findFirst({
      where: {
        token: decryptedToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!existingToken)
      return next(new AppError("Invalid or expired token", 400));

    const user: User | null = await prisma.user.findFirst({
      where: { id: existingToken?.userId },
    });

    const salt = genSaltSync(10);
    const passwordHash = hashSync(newPassword, salt);

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        password: passwordHash,
      },
    });

    await prisma.token.delete({
      where: {
        id: existingToken?.id,
      },
    });

    const userAgent = parser(req.headers["user-agent"]);

    const browser: string = userAgent.browser.name || "Not detected";
    const OS: string = `${userAgent.os.name || "Not detected"} (${
      userAgent.os.version || "Not detected"
    })`;

    const subject = `${user?.firstName}, Your password was successfully reset`;
    const send_to = user?.email!;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = resetSuccess({
      username: user?.lastName,
      browser,
      OS,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `Password reset successful!`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);
