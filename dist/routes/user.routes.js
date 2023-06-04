"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", user_controller_1.getUsers);
router.route("/:userId").get(user_controller_1.getSingleUser).put(auth_middleware_1.verifyAuth, user_controller_1.updateUser);
exports.default = router;
