"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyAuth);
router.post("/", like_controller_1.likePost);
exports.default = router;
