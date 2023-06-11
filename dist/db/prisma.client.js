"use strict";
// import { PrismaClient } from "./prisma/@prisma/client";
// const prisma = new PrismaClient();
Object.defineProperty(exports, "__esModule", { value: true });
// export default prisma;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
