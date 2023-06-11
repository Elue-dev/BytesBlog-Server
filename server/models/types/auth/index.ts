import { Request } from "express";
import { User } from "../user";
export interface SignUpPayload {
  firstname: string;
  lastname: string;
  email: string;
  avatar: string;
  password: string;
  interests: string;
  withGoogle: boolean;
}

export type LoginPayload = Pick<SignUpPayload, "email" | "password">;

export interface passwordResetType {
  username: string;
  url: string;
  withGoogle: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: User | null;
}
