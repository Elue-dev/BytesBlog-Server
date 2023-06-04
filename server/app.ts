import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppError } from "./helpers/global.error";
import errorHandler from "./helpers/error";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import postRouter from "./routes/post.routes";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://bytes-blog-client.vercel.app/"],
  })
);

app.use((req, res, next) => {
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} with method ${req.method} on this server`,
      404
    )
  );
});

app.use(errorHandler);

export default app;
