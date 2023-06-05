import { Router } from "express";
import { likeDislikePost } from "../controllers/like.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/:postId", verifyAuth, likeDislikePost);

export default router;
