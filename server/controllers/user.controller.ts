import { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma.client";

import handleAsync from "../helpers/async.handler";

export const getUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany();
    res.json(users);
  }
);
