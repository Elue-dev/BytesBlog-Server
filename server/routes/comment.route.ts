import { Router } from "express";
import { addComment, getComments } from "../controllers/comment.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get(getComments).post(verifyAuth, addComment);

export default router;
