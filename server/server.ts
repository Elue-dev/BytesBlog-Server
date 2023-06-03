import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 9000;

const server = express();

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
