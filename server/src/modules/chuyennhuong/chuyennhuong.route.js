import express from "express";
import * as controller from "./chuyennhuong.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();


router.post("/create", protect, authorize("KhachHang"), controller.create);

router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

router.get("/:id", protect, authorize("QuanLy", "ChuNha", "KhachHang"), controller.getById);

router.put("/approve/:id", protect, authorize("ChuNha"), controller.approve);

router.put("/reject/:id", protect, authorize("ChuNha"), controller.reject);

export default router;
