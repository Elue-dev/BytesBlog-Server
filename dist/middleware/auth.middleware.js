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
exports.verifyAuth = void 0;
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
exports.verifyAuth = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    const headers = req.headers.authorization;
    if (headers && headers.startsWith("Bearer"))
        token = headers.split(" ")[1];
    if (!token)
        return next(new global_error_1.AppError("You are not logged in. Please login to get access", 400));
    try {
        const verifiedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const currentUser = yield prisma_client_1.default.user.findUnique({
            where: { id: verifiedToken.id },
        });
        req.user = currentUser;
    }
    catch (error) {
        return next(new global_error_1.AppError("Session expired. Please log in again", 401));
    }
    next();
}));
