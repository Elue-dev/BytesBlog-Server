import { Response, Request, NextFunction } from "express";

const sendErrorDev = (err: any, res: Response) => {
  const errorObj =
    process.env.NODE_ENV === "development"
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

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  sendErrorDev(err, res);
};
