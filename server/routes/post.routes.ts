import { Router } from "express";
import { addPost, getPosts } from "../controllers/post.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get(getPosts).post(verifyAuth, addPost);

export default router;
