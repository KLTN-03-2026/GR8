import express from "express";
import * as controller from "./yeucauthue.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, authorize("KhachHang", "NguoiThue"), controller.create);

router.get("/my", protect, authorize("KhachHang", "NguoiThue"), controller.getMyRequests);

router.get("/", protect, authorize("QuanLy"), controller.getAll);

router.get("/:id", protect, authorize("QuanLy"), controller.getById);

// Quản lý duyệt trực tiếp (không cần chủ nhà)
router.put("/manager-approve/:id", protect, authorize("QuanLy"), controller.managerApprove);

router.put("/reject/:id", protect, authorize("QuanLy"), controller.reject);

export default router;
