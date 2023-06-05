import { Router } from "express";
import { likePost } from "../controllers/like.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(verifyAuth);
router.post("/", likePost);

export default router;
