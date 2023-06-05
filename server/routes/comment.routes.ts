import { Router } from "express";
import {
  addComment,
  getComments,
  getCommentsById,
  getPostComments,
} from "../controllers/comment.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/:postId/:commentId").get(getCommentsById);
router.route("/:postId").get(getPostComments);
router.route("/").get(getComments).post(verifyAuth, addComment);

export default router;
