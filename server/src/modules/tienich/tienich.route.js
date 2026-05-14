import express from "express";
import * as controller from "./tienich.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tiện ích
 *   description: Quản lý tiện ích căn hộ
 */

/**
 * @swagger
 * /api/tienich:
 *   get:
 *     summary: Danh sách tiện ích
 *     tags: [Tiện ích]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/tienich:
 *   post:
 *     summary: Thêm tiện ích mới
 *     tags: [Tiện ích]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenTienIch]
 *             properties:
 *               TenTienIch:
 *                 type: string
 *               MoTa:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post("/", protect, authorize("QuanLy"), controller.create);

/**
 * @swagger
 * /api/tienich/{id}:
 *   put:
 *     summary: Sửa tiện ích
 *     tags: [Tiện ích]
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
 * /api/tienich/{id}:
 *   delete:
 *     summary: Xóa tiện ích
 *     tags: [Tiện ích]
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
router.delete("/:id", protect, authorize("QuanLy"), controller.remove);

/**
 * @swagger
 * /api/tienich/canho/{canhoId}:
 *   post:
 *     summary: Gán tiện ích cho căn hộ
 *     tags: [Tiện ích]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: canhoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TienIchID]
 *             properties:
 *               TienIchID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Gán thành công
 */
router.post("/canho/:canhoId", protect, authorize("QuanLy", "ChuNha"), controller.ganTienIch);

/**
 * @swagger
 * /api/tienich/canho/{canhoId}/{tienichId}:
 *   delete:
 *     summary: Gỡ tiện ích khỏi căn hộ
 *     tags: [Tiện ích]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: canhoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tienichId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gỡ thành công
 */
router.delete("/canho/:canhoId/:tienichId", protect, authorize("QuanLy", "ChuNha"), controller.goTienIch);

export default router;
