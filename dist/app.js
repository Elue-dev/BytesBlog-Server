"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const global_error_1 = require("./helpers/global.error");
const error_1 = __importDefault(require("./helpers/error"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const bookmark_routes_1 = __importDefault(require("./routes/bookmark.routes"));
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use((0, express_1.json)());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://bytes-blog-client.vercel.app",
        "exp://172.20.10.10:19000",
    ],
    credentials: true,
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use((req, res, next) => {
    next();
});
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/posts", post_routes_1.default);
app.use("/api/v1/comments", comment_routes_1.default);
app.use("/api/v1/likeDislike", like_routes_1.default);
app.use("/api/v1/bookmarks", bookmark_routes_1.default);
app.all("*", (req, res, next) => {
    next(new global_error_1.AppError(`Can't find ${req.originalUrl} with method ${req.method} on this server`, 404));
});
app.use(error_1.default);
exports.default = app;
