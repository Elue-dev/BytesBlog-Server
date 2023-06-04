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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getSingleUser = exports.getUsers = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
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
    const { firstName, lastName, avatar, bio, interests } = req.body;
    if (!firstName && !lastName && !avatar && !bio && !interests)
        return next(new global_error_1.AppError("Please provide at least one credential you want to update", 404));
    const user = yield prisma_client_1.default.user.findFirst({
        where: {
            id: req.params.userId,
        },
    });
    if (!user)
        return next(new global_error_1.AppError("User could not be found", 404));
    const updatedUser = yield prisma_client_1.default.user.update({
        where: {
            id: user.id,
        },
        data: {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            avatar: avatar || user.avatar,
            bio: bio || user.bio,
            interests: interests || user.interests,
        },
    });
    res.status(200).json({
        status: "success",
        updatedUser,
    });
}));
