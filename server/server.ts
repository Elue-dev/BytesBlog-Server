import dotenv from "dotenv";
import http from "http";
import prisma from "./db/prisma.client";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 9000;

let server: http.Server;

prisma
  .$connect()
  .then(() => {
    console.log("Prisma is connected");
    server = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Failed to connect to Prisma:", error);
  });
