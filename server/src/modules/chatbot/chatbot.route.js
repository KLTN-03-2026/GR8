import express from "express";
import * as chatbotController from "./chatbot.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/message", chatbotController.sendMessage);
router.get("/session/:sessionId", chatbotController.getChatHistory);
router.get("/my-session", chatbotController.getMySession);

export default router;
