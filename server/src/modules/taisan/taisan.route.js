import express from "express";
import * as controller from "./taisan.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tài sản
 *   description: Quản lý tài sản trong căn hộ
 */

/**
 * @swagger
 * /api/taisan:
 *   get:
 *     summary: Danh sách tài sản (filter theo CanHoID, TinhTrang, LoaiTaiSan)
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: CanHoID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: TinhTrang
 *         schema:
 *           type: string
 *           enum: [Tot, Hong, DangSua, Mat, Cu]
 *       - in: query
 *         name: LoaiTaiSan
 *         schema:
 *           type: string
 *           enum: [ThietBiCanHo, NoiThat, ThietBiDien, CoSoVatChat]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

// Người thuê xem tài sản căn hộ đang thuê — phải đặt TRƯỚC /:id
router.get("/my-apartment", protect, authorize("NguoiThue", "KhachVangLai"), controller.getMyApartmentAssets);

router.get("/stats/thongke", protect, authorize("QuanLy"), controller.thongKe);

router.get("/public/:CanHoID", controller.getPublicAssetsByCanHoId);

// Import Excel — phải đặt TRƯỚC /:id
router.post("/import-excel", protect, authorize("QuanLy", "ChuNha"), controller.importExcel);

router.get("/:id", protect, authorize("QuanLy", "ChuNha"), controller.getById);

/**
 * @swagger
 * /api/taisan:
 *   post:
 *     summary: Thêm tài sản mới vào căn hộ
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaTaiSan, TenTaiSan, CanHoID]
 *             properties:
 *               MaTaiSan:
 *                 type: string
 *               TenTaiSan:
 *                 type: string
 *               CanHoID:
 *                 type: integer
 *                 description: ID của căn hộ (bắt buộc)
 *               LoaiTaiSan:
 *                 type: string
 *                 enum: [ThietBiCanHo, NoiThat, ThietBiDien, CoSoVatChat]
 *                 default: ThietBiCanHo
 *               ViTri:
 *                 type: string
 *                 description: Vị trí tài sản trong căn hộ
 *               SoLuong:
 *                 type: integer
 *                 default: 1
 *               TinhTrang:
 *                 type: string
 *                 enum: [Tot, Hong, DangSua, Mat, Cu]
 *                 default: Tot
 *               GiaTri:
 *                 type: number
 *               NgayMua:
 *                 type: string
 *                 format: date
 *               NhaCungCap:
 *                 type: string
 *               GhiChu:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post("/", protect, authorize("QuanLy", "ChuNha"), controller.create);

router.put("/:id", protect, authorize("QuanLy", "ChuNha"), controller.update);

router.delete("/:id", protect, authorize("QuanLy", "ChuNha"), controller.remove);

export default router;
