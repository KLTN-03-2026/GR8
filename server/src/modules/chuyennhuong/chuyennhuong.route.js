import express from "express";
import * as controller from "./chuyennhuong.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();


router.post("/", protect, authorize("NguoiThue", "KhachVangLai"), controller.create);

router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

router.get("/my", protect, authorize("NguoiThue", "KhachVangLai"), controller.getMyTransfers);

router.get("/:id", protect, authorize("QuanLy", "ChuNha", "KhachHang"), controller.getById);

router.put("/:id/duyet", protect, authorize("ChuNha", "QuanLy"), controller.approve);
router.put("/:id/tuchoi", protect, authorize("ChuNha", "QuanLy"), controller.reject);

// backward compatible endpoints
router.put("/approve/:id", protect, authorize("ChuNha", "QuanLy"), controller.approve);
router.put("/reject/:id", protect, authorize("ChuNha", "QuanLy"), controller.reject);

export default router;
