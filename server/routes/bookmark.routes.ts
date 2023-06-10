import { Router } from "express";
import {
  addRemoveBookmark,
  getBookmarks,
} from "../controllers/bookmark.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", verifyAuth, getBookmarks);
router.post("/addRemoveBookmark/:postId", verifyAuth, addRemoveBookmark);

export default router;
