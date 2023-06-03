import { Router } from "express";
import {
  forgotPassword,
  googleLogin,
  login,
  resetPassword,
  signup,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/login/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
