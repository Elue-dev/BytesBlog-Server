import { Router } from "express";
import { addRemoveBookmark } from "../controllers/bookmark.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/:postId").post(verifyAuth, addRemoveBookmark);

export default router;
