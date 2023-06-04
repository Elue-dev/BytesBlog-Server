import { Router } from "express";
import {
  getSingleUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);

router.route("/:userId").get(getSingleUser).put(updateUser);

export default router;
