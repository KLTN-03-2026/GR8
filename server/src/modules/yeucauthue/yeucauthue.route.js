import express from "express";
import * as controller from "./yeucauthue.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, authorize("KhachHang"), controller.create);

router.get("/my", protect, authorize("KhachHang"), controller.getMyRequests);

router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

router.get("/:id", protect, authorize("QuanLy", "ChuNha"), controller.getById);

// Quản lý kiểm tra và chuyển sang ChoDuyet
router.put("/manager-approve/:id", protect, authorize("QuanLy"), controller.managerApprove);

router.put("/owner-approve/:id", protect, authorize("ChuNha"), controller.ownerApprove);

router.put("/reject/:id", protect, authorize("QuanLy", "ChuNha"), controller.reject);

export default router;
