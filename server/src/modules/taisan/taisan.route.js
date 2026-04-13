import express from "express";
import * as controller from "./taisan.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tài sản
 *   description: Quản lý tài sản tòa nhà / căn hộ
 */

/**
 * @swagger
 * /api/taisan:
 *   get:
 *     summary: Danh sách tài sản (filter theo ToaNhaID, CanHoID, TinhTrang, LoaiTaiSan)
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ToaNhaID
 *         schema:
 *           type: integer
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
 *           enum: [ThietBiChung, ThietBiCanHo, NoiThat, ThietBiDien, CoSoVatChat]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", protect, authorize("QuanLy", "ChuNha"), controller.getAll);

/**
 * @swagger
 * /api/taisan/{id}:
 *   get:
 *     summary: Chi tiết tài sản
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/:id", protect, authorize("QuanLy", "ChuNha"), controller.getById);

/**
 * @swagger
 * /api/taisan:
 *   post:
 *     summary: Thêm tài sản mới
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaTaiSan, TenTaiSan]
 *             properties:
 *               MaTaiSan:
 *                 type: string
 *               TenTaiSan:
 *                 type: string
 *               LoaiTaiSan:
 *                 type: string
 *                 enum: [ThietBiChung, ThietBiCanHo, NoiThat, ThietBiDien, CoSoVatChat]
 *               ToaNhaID:
 *                 type: integer
 *               CanHoID:
 *                 type: integer
 *               TinhTrang:
 *                 type: string
 *                 enum: [Tot, Hong, DangSua, Mat, Cu]
 *               GiaTri:
 *                 type: number
 *               NgayMua:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post("/", protect, authorize("QuanLy", "ChuNha"), controller.create);

/**
 * @swagger
 * /api/taisan/{id}:
 *   put:
 *     summary: Cập nhật tài sản
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", protect, authorize("QuanLy", "ChuNha"), controller.update);

/**
 * @swagger
 * /api/taisan/{id}:
 *   delete:
 *     summary: Xóa mềm tài sản
 *     tags: [Tài sản]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", protect, authorize("QuanLy", "ChuNha"), controller.remove);

export default router;
