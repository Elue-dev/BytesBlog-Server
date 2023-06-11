import { Router } from "express";
import {
  addRemoveBookmark,
  getBookmarks,
  removePostFromBookmarks,
} from "../controllers/bookmark.controller";
import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", verifyAuth, getBookmarks);
router.delete("/remove/:bookmarkId", verifyAuth, removePostFromBookmarks);
router.post("/addRemoveBookmark/:postId", verifyAuth, addRemoveBookmark);

export default router;
