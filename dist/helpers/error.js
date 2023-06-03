"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendErrorDev = (err, res) => {
    const errorObj = process.env.NODE_ENV === "development"
        ? {
            status: err.status,
            message: err.message,
            stack: err.stack,
        }
        : {
            status: err.status,
            message: err.message,
        };
    res.status(err.statusCode).json(errorObj);
};
exports.default = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    sendErrorDev(err, res);
};
