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
exports.addComment = exports.getPostComments = exports.getCommentsById = exports.getComments = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const AUTHOR_FIELDS = {
    id: true,
    avatar: true,
    firstName: true,
    lastName: true,
};
exports.getComments = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield prisma_client_1.default.comment.findMany({
        include: {
            author: {
                select: AUTHOR_FIELDS,
            },
            children: {
                include: {
                    author: {
                        select: AUTHOR_FIELDS,
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        comments,
    });
}));
exports.getCommentsById = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield prisma_client_1.default.comment.findMany({
        where: {
            id: req.params.commentId,
        },
        include: {
            author: {
                select: AUTHOR_FIELDS,
            },
            children: {
                include: {
                    author: {
                        select: AUTHOR_FIELDS,
                    },
                    children: {
                        include: {
                            author: {
                                select: AUTHOR_FIELDS,
                            },
                        },
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        comments,
    });
}));
exports.getPostComments = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield prisma_client_1.default.comment.findMany({
        where: {
            postId: req.params.postId,
        },
        include: {
            author: {
                select: AUTHOR_FIELDS,
            },
            children: {
                include: {
                    author: {
                        select: AUTHOR_FIELDS,
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        comments,
    });
}));
exports.addComment = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message, parentId, postId } = req.body;
    let missingFields = [];
    let bodyObject = { message, postId };
    for (let field in bodyObject) {
        if (!req.body[field])
            missingFields.push(field);
    }
    if (missingFields.length > 0)
        return next(new global_error_1.AppError(`comment ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`, 400));
    const comment = yield prisma_client_1.default.comment.create({
        data: {
            message,
            authorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            parentId,
            postId,
        },
    });
    res.status(200).json({
        status: "success",
        comment,
    });
}));
