import express from "express";
import * as controller from "./toanha.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tòa nhà
 *   description: Quản lý tòa nhà
 */

/**
 * @swagger
 * /api/toanha:
 *   get:
 *     summary: Danh sách tòa nhà
 *     tags: [Tòa nhà]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/toanha/{id}:
 *   get:
 *     summary: Chi tiết tòa nhà + danh sách căn hộ
 *     tags: [Tòa nhà]
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
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/toanha:
 *   post:
 *     summary: Tạo tòa nhà mới
 *     tags: [Tòa nhà]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenToaNha, DiaChi, SoTang, ChuNhaID]
 *             properties:
 *               TenToaNha:
 *                 type: string
 *               DiaChi:
 *                 type: string
 *               SoTang:
 *                 type: integer
 *               ChuNhaID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", protect, authorize("ChuNha", "QuanLy"), controller.create);

/**
 * @swagger
 * /api/toanha/{id}:
 *   put:
 *     summary: Cập nhật tòa nhà
 *     tags: [Tòa nhà]
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
router.put("/:id", protect, authorize("ChuNha", "QuanLy"), controller.update);

/**
 * @swagger
 * /api/toanha/{id}:
 *   delete:
 *     summary: Xóa tòa nhà
 *     tags: [Tòa nhà]
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
router.delete("/:id", protect, authorize("ChuNha"), controller.remove);

export default router;
