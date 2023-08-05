import { Router } from "express";
import {
  addPost,
  getPosts,
  getSinglePost,
  updatePost,
} from "../controllers/post.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get(getPosts).post(verifyAuth, addPost);
router.route("/:slug/:postId").get(getSinglePost).put(verifyAuth, updatePost);

export default router;
