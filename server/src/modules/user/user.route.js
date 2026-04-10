import express from "express";
import * as controller from "./user.controller.js";

const router = express.Router();

router.get("/", controller.getUsers);
router.post("/", controller.createUser);

export default router;