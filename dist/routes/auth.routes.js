"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/signup", auth_controller_1.signup);
router.post("/login", auth_controller_1.login);
router.post("/login/google", auth_controller_1.googleLogin);
router.post("/forgot-password", auth_controller_1.forgotPassword);
router.post("/reset-password/:token", auth_controller_1.resetPassword);
exports.default = router;
