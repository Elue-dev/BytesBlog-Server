import express, { json } from "express";

import cookieParser from "cookie-parser";
import { AppError } from "./helpers/global.error";
import errorHandler from "./helpers/error";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(json());
app.use(cookieParser());

app.use((req, res, next) => {
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export default app;
