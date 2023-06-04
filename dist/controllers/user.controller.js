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
exports.updateUser = exports.getSingleUser = exports.getUsers = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const generate_token_1 = require("../lib/generate.token");
exports.getUsers = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_client_1.default.user.findMany();
    res.status(200).json({
        status: "success",
        users,
    });
}));
exports.getSingleUser = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_client_1.default.user.findFirst({
        where: {
            id: req.params.id,
        },
    });
    if (!user)
        return next(new global_error_1.AppError("User could not be found", 404));
    res.status(200).json({
        status: "success",
        user,
    });
}));
exports.updateUser = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstName, lastName, avatar, bio, interests } = req.body;
    if (!firstName && !lastName && !avatar && !bio && !interests)
        return next(new global_error_1.AppError("Please provide at least one credential you want to update", 400));
    const existingUser = yield prisma_client_1.default.user.findFirst({
        where: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
    });
    if (!existingUser)
        return next(new global_error_1.AppError("User could not be found", 404));
    const user = yield prisma_client_1.default.user.update({
        where: {
            id: existingUser.id,
        },
        data: {
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            avatar: avatar || existingUser.avatar,
            bio: bio || existingUser.bio,
            interests: interests || existingUser.interests,
        },
    });
    const token = (0, generate_token_1.generateToken)(existingUser.id);
    const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
    const updatedUser = Object.assign({ token }, userWithoutPassword);
    res.status(200).json({
        status: "success",
        updatedUser,
    });
}));
