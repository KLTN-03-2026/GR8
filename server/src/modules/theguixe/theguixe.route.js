import express from "express";
import * as controller from "./theguixe.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Thẻ gửi xe
 *   description: Quản lý thẻ gửi xe
 */

/**
 * @swagger
 * /api/theguixe:
 *   get:
 *     summary: Danh sách thẻ gửi xe (filter TrangThai, LoaiXe, LoaiThe)
 *     tags: [Thẻ gửi xe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", protect, authorize("QuanLy", "KeToan"), controller.getAll);

/**
 * @swagger
 * /api/theguixe/me:
 *   get:
 *     summary: Thẻ gửi xe của tôi
 *     tags: [Thẻ gửi xe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/me", protect, controller.getMyThe);

/**
 * @swagger
 * /api/theguixe/{id}:
 *   get:
 *     summary: Chi tiết thẻ gửi xe
 *     tags: [Thẻ gửi xe]
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
router.get("/:id", protect, authorize("QuanLy"), controller.getById);

/**
 * @swagger
 * /api/theguixe:
 *   post:
 *     summary: Cấp thẻ gửi xe mới
 *     tags: [Thẻ gửi xe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaThe, NguoiDungID, LoaiThe, LoaiXe, NgayLap]
 *             properties:
 *               MaThe:
 *                 type: string
 *               NguoiDungID:
 *                 type: integer
 *               CanHoID:
 *                 type: integer
 *               LoaiThe:
 *                 type: string
 *                 enum: [Thang, Ngay, Tam]
 *               LoaiXe:
 *                 type: string
 *                 enum: [OTo, XeMay]
 *               BienSoXe:
 *                 type: string
 *               NgayLap:
 *                 type: string
 *                 format: date
 *               NgayHetHan:
 *                 type: string
 *                 format: date
 *               SoTienDaNop:
 *                 type: number
 *     responses:
 *       201:
 *         description: Cấp thẻ thành công
 */
router.post("/", protect, authorize("QuanLy"), controller.create);

/**
 * @swagger
 * /api/theguixe/{id}:
 *   put:
 *     summary: Cập nhật thẻ (gia hạn, đổi trạng thái)
 *     tags: [Thẻ gửi xe]
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
router.put("/:id", protect, authorize("QuanLy"), controller.update);

/**
 * @swagger
 * /api/theguixe/{id}:
 *   delete:
 *     summary: Hủy thẻ gửi xe
 *     tags: [Thẻ gửi xe]
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
 *         description: Hủy thành công
 */
router.delete("/:id", protect, authorize("QuanLy"), controller.remove);

export default router;
