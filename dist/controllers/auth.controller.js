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
exports.login = exports.signup = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const crypto_js_1 = __importDefault(require("crypto-js"));
const generate_token_1 = require("../lib/generate.token");
exports.signup = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password, interests } = req.body;
    let missingFields = [];
    let bodyObject = { firstname, lastname, email, password, interests };
    for (let field in bodyObject) {
        if (!req.body[field])
            missingFields.push(field);
    }
    if (missingFields.length > 0)
        return next(new global_error_1.AppError(`user ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`, 400));
    const userExists = yield prisma_client_1.default.user.findFirst({ where: { email } });
    if (userExists)
        return next(new global_error_1.AppError("Email already in use", 400));
    const passwordHash = crypto_js_1.default.AES.encrypt(password, process.env.SECRET_KEY).toString();
    const newUser = yield prisma_client_1.default.user.create({
        data: {
            firstName: firstname,
            lastName: lastname,
            email,
            password: passwordHash,
            avatar: "",
            interests,
            bio: "",
        },
    });
    res.status(201).json({
        status: "success",
        user: newUser,
        message: "User created.",
    });
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
    const bytes = crypto_js_1.default.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(crypto_js_1.default.enc.Utf8);
    if (originalPassword !== password)
        return next(new global_error_1.AppError("Invalid credentials provided", 400));
    const token = (0, generate_token_1.generateToken)(user.id);
    const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
    const userInfo = Object.assign({ token }, userWithoutPassword);
    res.status(200).json({
        status: "success",
        user: userInfo,
    });
}));
