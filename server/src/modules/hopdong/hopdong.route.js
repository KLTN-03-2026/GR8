import express from "express";
import * as controller from "./hopdong.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, authorize("QuanLy", "ChuNha"), controller.create);

router.put("/sign/:id", protect, authorize("KhachHang"), controller.sign);

router.put("/terminate/:id", protect, authorize("QuanLy", "ChuNha"), controller.terminate);

router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

router.get("/my", protect, authorize("KhachHang"), controller.myContract);

router.get("/:id", protect, authorize("QuanLy", "ChuNha", "KhachHang"), controller.getById);

export default router;
