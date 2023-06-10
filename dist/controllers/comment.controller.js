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
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const email_service_1 = __importDefault(require("../services/email.service"));
const comment_email_1 = require("../views/comment.email");
const reply_email_1 = require("../views/reply.email");
const AUTHOR_FIELDS = {
    id: true,
    avatar: true,
    firstName: true,
    lastName: true,
    email: true,
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
        orderBy: {
            createdAt: client_1.Prisma.SortOrder.desc,
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
        orderBy: {
            createdAt: client_1.Prisma.SortOrder.desc,
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
            post: {
                include: {
                    author: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: client_1.Prisma.SortOrder.desc,
        },
    });
    res.status(200).json({
        status: "success",
        comments,
    });
}));
exports.addComment = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message, parentId, postId, authorEmail, path, isReplying } = req.body;
    let missingFields = [];
    let bodyObject = { message, postId, authorEmail, path };
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
    const commentAuthor = yield prisma_client_1.default.user.findFirst({
        where: {
            email: authorEmail,
        },
    });
    const post = yield prisma_client_1.default.post.findFirst({
        where: {
            id: postId,
        },
        include: {
            author: {
                select: AUTHOR_FIELDS,
            },
        },
    });
    const replySubject = `New Reply on your comment`;
    const reply_send_to = authorEmail;
    const commentSubject = `New Comment on your post`;
    const comment_send_to = authorEmail;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const replyBody = (0, reply_email_1.emailReply)(post === null || post === void 0 ? void 0 : post.author.firstName, path);
    const commentBody = (0, comment_email_1.commentEmail)(commentAuthor === null || commentAuthor === void 0 ? void 0 : commentAuthor.firstName, path, message);
    try {
        (0, email_service_1.default)({
            subject: isReplying ? replySubject : commentSubject,
            body: isReplying ? replyBody : commentBody,
            send_to: isReplying ? reply_send_to : comment_send_to,
            sent_from,
            reply_to,
        });
        res.status(200).json({
            status: "success",
            comment,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Something went wrong. Please try again.`,
        });
    }
}));
