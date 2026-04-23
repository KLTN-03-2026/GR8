import express from "express";
import {
  createChiSoDienNuoc,
  getAllChiSoDienNuoc,
  getChiSoDienNuocById,
  updateChiSoDienNuoc,
  deleteChiSoDienNuoc,
} from "./chisodiennuoc.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import {
  validate,
  createChiSoDienNuocSchema,
  updateChiSoDienNuocSchema,
  idParamSchema,
  queryFilterSchema,
} from "./chisodiennuoc.validation.js";

const router = express.Router();

// ==================== MIDDLEWARE ====================
router.use(protect);

// ==================== ROLE ====================
const ROLE = {
  TECH: "NhanVienKyThuat",
};

const requireTechnician = authorize(ROLE.TECH);

// ==================== ROUTES ====================

// READ
router.get("/", validate(queryFilterSchema, "query"), getAllChiSoDienNuoc);
router.get("/:id", validate(idParamSchema, "params"), getChiSoDienNuocById);

// WRITE
router.post(
  "/",
  requireTechnician,
  validate(createChiSoDienNuocSchema, "body"),
  createChiSoDienNuoc
);

router.put(
  "/:id",
  requireTechnician,
  validate(idParamSchema, "params"),
  validate(updateChiSoDienNuocSchema, "body"),
  updateChiSoDienNuoc
);

router.delete(
  "/:id",
  requireTechnician,
  validate(idParamSchema, "params"),
  deleteChiSoDienNuoc
);

export default router;