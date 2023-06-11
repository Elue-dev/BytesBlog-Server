"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.googleLogin = exports.login = exports.signup = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const generate_token_1 = require("../helpers/generate.token");
const welcome_email_1 = require("../views/welcome.email");
const email_service_1 = __importDefault(require("../services/email.service"));
const crypto_1 = require("crypto");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const reset_email_1 = require("../views/reset.email");
const reset_success_email_1 = require("../views/reset.success.email");
const bcryptjs_1 = require("bcryptjs");
exports.signup = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password, interests, avatar, withGoogle, } = req.body;
    let missingFields = [];
    let bodyObject = {
        firstname,
        lastname,
        email,
        password,
        interests,
    };
    for (let field in bodyObject) {
        if (!req.body[field])
            missingFields.push(field);
    }
    if (missingFields.length > 0)
        return next(new global_error_1.AppError(`user ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`, 400));
    const userExists = yield prisma_client_1.default.user.findFirst({ where: { email } });
    if (userExists && userExists.withGoogle)
        return next(new global_error_1.AppError("Account has been signed up with google, sign in instead", 400));
    if (userExists)
        return next(new global_error_1.AppError("Email already in use", 400));
    const salt = (0, bcryptjs_1.genSaltSync)(10);
    const passwordHash = (0, bcryptjs_1.hashSync)(password, salt);
    const newUser = yield prisma_client_1.default.user.create({
        data: {
            firstName: firstname,
            lastName: lastname,
            email,
            password: passwordHash,
            avatar: avatar || "",
            interests,
            bio: "",
            withGoogle,
        },
    });
    const subject = `Welcome Onboard, ${newUser.firstName}!`;
    const send_to = newUser.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, welcome_email_1.welcome)(newUser.lastName);
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(201).json({
            status: "success",
            message: "User created.",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Something went wrong. Please try again.`,
        });
    }
}));
exports.login = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let missingFields = [];
    let bodyObject = { email, password };
    for (let field in bodyObject) {
        if (!req.body[field])
            missingFields.push(field);
    }
    if (missingFields.length > 0)
        return next(new global_error_1.AppError(`user ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`, 400));
    const user = yield prisma_client_1.default.user.findFirst({ where: { email } });
    if (!user)
        return next(new global_error_1.AppError("Invalid credentials provided", 400));
    const passwordIscorrect = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!passwordIscorrect)
        return next(new global_error_1.AppError("Invalid credentials provided", 400));
    const token = (0, generate_token_1.generateToken)(user.id);
    const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
    const userInfo = Object.assign({ token }, userWithoutPassword);
    res.status(200).json({
        status: "success",
        user: userInfo,
    });
}));
exports.googleLogin = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield prisma_client_1.default.user.findFirst({ where: { email } });
    if (!user)
        return next(new global_error_1.AppError("User not registered. Sign up with google first", 404));
    const token = (0, generate_token_1.generateToken)(user.id);
    const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
    const userInfo = Object.assign({ token }, userWithoutPassword);
    res.status(200).json({
        status: "success",
        user: userInfo,
    });
}));
exports.forgotPassword = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        return next(new global_error_1.AppError("Please provide the email associated with your account", 400));
    const user = yield prisma_client_1.default.user.findFirst({ where: { email } });
    if (!user)
        return next(new global_error_1.AppError("The email provided is not registered", 404));
    const resetToken = (0, crypto_1.randomBytes)(32).toString("hex") + user.id;
    const hashedToken = (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex");
    yield prisma_client_1.default.token.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}?withGoogle=${user.withGoogle}`;
    const subject = user.withGoogle
        ? "Password creation for your google account"
        : "Password Reset Request";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, reset_email_1.passwordResetEmail)({
        username: user.firstName,
        url: resetUrl,
        withGoogle: user.withGoogle,
    });
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            withGoogle: user.withGoogle,
            message: user.withGoogle
                ? `An email has been sent to ${email} with instructions
        to create a password for your google account`
                : `An email has been sent to ${email} with instructions
        to reset your password`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.resetPassword = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword, confirmNewPassword } = req.body;
    const { token } = req.params;
    if (!newPassword || !confirmNewPassword)
        return next(new global_error_1.AppError("Please provide all password credentials", 400));
    if (newPassword !== confirmNewPassword)
        return next(new global_error_1.AppError("New password credentials do not match", 400));
    const decryptedToken = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
    const existingToken = yield prisma_client_1.default.token.findFirst({
        where: {
            token: decryptedToken,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    if (!existingToken)
        return next(new global_error_1.AppError("Invalid or expired token", 400));
    const user = yield prisma_client_1.default.user.findFirst({
        where: { id: existingToken === null || existingToken === void 0 ? void 0 : existingToken.userId },
    });
    const salt = (0, bcryptjs_1.genSaltSync)(10);
    const passwordHash = (0, bcryptjs_1.hashSync)(newPassword, salt);
    yield prisma_client_1.default.user.update({
        where: {
            id: user === null || user === void 0 ? void 0 : user.id,
        },
        data: {
            password: passwordHash,
        },
    });
    yield prisma_client_1.default.token.delete({
        where: {
            id: existingToken === null || existingToken === void 0 ? void 0 : existingToken.id,
        },
    });
    const userAgent = (0, ua_parser_js_1.default)(req.headers["user-agent"]);
    const browser = userAgent.browser.name || "Not detected";
    const OS = `${userAgent.os.name || "Not detected"} (${userAgent.os.version || "Not detected"})`;
    const subject = `${user === null || user === void 0 ? void 0 : user.firstName}, Your password was successfully reset`;
    const send_to = user === null || user === void 0 ? void 0 : user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, reset_success_email_1.resetSuccess)({
        username: user === null || user === void 0 ? void 0 : user.lastName,
        browser,
        OS,
    });
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: `Password reset successful!`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
