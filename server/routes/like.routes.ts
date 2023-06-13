import { Router } from "express";
import {
  likeDislikeComment,
  likeDislikePost,
} from "../controllers/like.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/:postId", verifyAuth, likeDislikePost);
router.post("/comment/:commentId", verifyAuth, likeDislikeComment);

export default router;
