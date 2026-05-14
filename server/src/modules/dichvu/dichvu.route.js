import express from "express";
import * as controller from "./dichvu.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

// ── Danh mục dịch vụ ─────────────────────────────────────────────────────────
// GET  /api/dichvu          - Tất cả (QuanLy thấy cả Inactive, còn lại chỉ Active)
// POST /api/dichvu          - Thêm dịch vụ (QuanLy)
// PUT  /api/dichvu/:id      - Sửa dịch vụ (QuanLy)
// DELETE /api/dichvu/:id    - Vô hiệu hóa dịch vụ (QuanLy)

router.get("/", protect, controller.getAll);
router.post("/", protect, authorize("QuanLy"), controller.create);
router.put("/:id", protect, authorize("QuanLy"), controller.update);
router.delete("/:id", protect, authorize("QuanLy"), controller.remove);

// ── Yêu cầu dịch vụ ──────────────────────────────────────────────────────────
// GET  /api/dichvu/yeucau           - Tất cả yêu cầu (QuanLy)
// GET  /api/dichvu/yeucau/my        - Yêu cầu của tôi (NguoiThue)
// POST /api/dichvu/yeucau           - Đặt dịch vụ (NguoiThue)
// PUT  /api/dichvu/yeucau/:id       - Duyệt / cập nhật trạng thái (QuanLy)
// DELETE /api/dichvu/yeucau/:id     - Hủy yêu cầu (NguoiThue)

router.get("/yeucau", protect, authorize("QuanLy"), controller.getAllYeuCau);
router.get("/yeucau/my", protect, authorize("NguoiThue", "KhachVangLai"), controller.getMyYeuCau);
router.post("/yeucau", protect, authorize("NguoiThue", "KhachVangLai"), controller.createYeuCau);
router.put("/yeucau/:id", protect, authorize("QuanLy"), controller.duyetYeuCau);
router.delete("/yeucau/:id", protect, authorize("NguoiThue", "KhachVangLai"), controller.deleteYeuCau);

export default router;
