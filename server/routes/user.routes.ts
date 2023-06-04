import { Router } from "express";
import {
  getSingleUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get(getUsers).put(verifyAuth, updateUser);
router.route("/:userId").get(getSingleUser);

export default router;
