"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.verifyAuth, bookmark_controller_1.getBookmarks);
router.post("/addRemoveBookmark/:postId", auth_middleware_1.verifyAuth, bookmark_controller_1.addRemoveBookmark);
exports.default = router;
