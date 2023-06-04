import { Router } from "express";
import {
  getSingleUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getUsers);
router.route("/:userId").get(getSingleUser).put(verifyAuth, updateUser);

export default router;
