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
exports.updatePost = exports.getSinglePost = exports.getPosts = exports.addPost = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const slugify_1 = require("../helpers/slugify");
const author_fields_1 = require("../utils/author.fields");
const LIKE_FIELDS = {
    id: true,
    avatar: true,
    firstName: true,
    lastName: true,
    bio: true,
    joinedAt: true,
    interests: true,
    posts: true,
};
exports.addPost = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, content, image, readTime, categories } = req.body;
    console.log(categories);
    let missingFields = [];
    let bodyObject = { title, content, image, readTime };
    for (let field in bodyObject) {
        if (!req.body[field])
            missingFields.push(field);
    }
    if (missingFields.length > 0)
        return next(new global_error_1.AppError(`post ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`, 400));
    const post = yield prisma_client_1.default.post.create({
        data: {
            title,
            content,
            image,
            readTime,
            categories,
            slug: (0, slugify_1.slugify)(title),
            authorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
    });
    res.status(200).json({
        status: "success",
        post,
    });
}));
exports.getPosts = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prisma_client_1.default.post.findMany({
        include: {
            author: {
                select: author_fields_1.AUTHOR_FIELDS,
            },
            likes: {
                include: {
                    user: {
                        select: LIKE_FIELDS,
                    },
                },
            },
            bookmarks: true,
        },
        orderBy: {
            createdAt: client_1.Prisma.SortOrder.desc,
        },
    });
    res.status(200).json({
        status: "success",
        posts,
    });
}));
exports.getSinglePost = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_client_1.default.post.findMany({
        where: {
            slug: req.params.slug,
        },
        include: {
            author: {
                select: author_fields_1.AUTHOR_FIELDS,
            },
            bookmarks: {
                include: {
                    user: {
                        select: author_fields_1.AUTHOR_FIELDS,
                    },
                },
            },
            comments: {
                include: {
                    author: {
                        select: author_fields_1.AUTHOR_FIELDS,
                    },
                },
            },
            likes: {
                include: {
                    user: {
                        select: {
                            id: true,
                            avatar: true,
                            firstName: true,
                            lastName: true,
                            bio: true,
                            joinedAt: true,
                            interests: true,
                            posts: true,
                        },
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        post,
    });
}));
exports.updatePost = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, image, readTime, categories } = req.body;
    if (!title && !content && !image && !readTime)
        return next(new global_error_1.AppError("Please provide at least one detail you want to update", 400));
    const post = yield prisma_client_1.default.post.findFirst({
        where: {
            slug: req.params.slug,
        },
    });
    if (!post)
        return next(new global_error_1.AppError("Post could not be found", 404));
    const updatedPost = yield prisma_client_1.default.post.update({
        where: {
            id: post.id,
        },
        data: {
            title: title || post.title,
            slug: title ? (0, slugify_1.slugify)(title) : post.slug,
            content: content || post.content,
            image: image || post.image,
            categories: categories || post.categories,
            readTime: readTime || post.readTime,
        },
    });
    res.status(200).json({
        status: "success",
        updatedPost,
    });
}));
