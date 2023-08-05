"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route("/").get(post_controller_1.getPosts).post(auth_middleware_1.verifyAuth, post_controller_1.addPost);
router.route("/:slug/:postId").get(post_controller_1.getSinglePost).put(auth_middleware_1.verifyAuth, post_controller_1.updatePost);
exports.default = router;
