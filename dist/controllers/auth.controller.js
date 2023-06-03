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
exports.signup = void 0;
const prisma_client_1 = __importDefault(require("../db/prisma.client"));
const async_handler_1 = __importDefault(require("../helpers/async.handler"));
const global_error_1 = require("../helpers/global.error");
const crypto_js_1 = __importDefault(require("crypto-js"));
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
