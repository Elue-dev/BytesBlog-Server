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
exports.removePostFromBookmarks = exports.getBookmarks = exports.addRemoveBookmark = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const author_fields_1 = require("../utils/author.fields");
exports.addRemoveBookmark = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { postId } = req.params;
    if (!postId)
        return next(new global_error_1.AppError("Please provide the id of the post", 400));
    const postToBookmark = yield prisma_client_1.default.post.findFirst({
        where: {
            id: postId,
        },
        include: {
            bookmarks: true,
        },
    });
    if (!postToBookmark)
        return next(new global_error_1.AppError("Post could not be found", 400));
    const userHasBookmarked = (_a = postToBookmark === null || postToBookmark === void 0 ? void 0 : postToBookmark.bookmarks) === null || _a === void 0 ? void 0 : _a.find((bookmark) => { var _a; return bookmark.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
    if (userHasBookmarked) {
        yield prisma_client_1.default.bookmark.deleteMany({
            where: {
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                postId,
            },
        });
    }
    else {
        yield prisma_client_1.default.bookmark.create({
            data: {
                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                postId,
            },
        });
    }
    res.status(200).json({
        status: "success",
        message: userHasBookmarked
            ? "Post removed from bookmarks"
            : "Post added to bookmarks",
    });
}));
exports.getBookmarks = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userBookmarks = yield prisma_client_1.default.bookmark.findMany({
        include: {
            post: {
                include: {
                    author: {
                        select: author_fields_1.AUTHOR_FIELDS,
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        bookmarks: userBookmarks,
    });
}));
exports.removePostFromBookmarks = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookmarkId } = req.params;
    yield prisma_client_1.default.bookmark.delete({
        where: {
            id: bookmarkId,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Bookmark removed",
    });
}));
