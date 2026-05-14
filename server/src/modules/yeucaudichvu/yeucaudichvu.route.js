// server/src/modules/yeucaudichvu/yeucaudichvu.route.js
import express from "express";
import { protect } from "../auth/auth.middleware.js";
import * as controller from "./yeucaudichvu.controller.js";

const router = express.Router();

router.use(protect);

// GET /api/yeucaudichvu - Lấy danh sách yêu cầu dịch vụ với filter
router.get("/", controller.getYeuCauDichVu);

export default router;
