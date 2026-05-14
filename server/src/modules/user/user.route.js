import express from "express";
import * as controller from "./user.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../../middleware/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { uploadAvatar, uploadCCCD } from "../../middleware/cloudinary-upload.middleware.js";
import {
  updateMyProfileSchema,
  updateUserByAdminSchema,
  userPaginationSchema,
} from "./user.validation.js";

const router = express.Router();

router.use(protect);

router.get("/me", controller.getMe);
router.patch("/me", validateBody(updateMyProfileSchema), controller.updateMe);
router.post("/me/avatar", uploadAvatar.single("avatar"), controller.uploadMyAvatar);
router.post("/me/cccd", uploadCCCD.fields([{ name: "matTruoc", maxCount: 1 }, { name: "matSau", maxCount: 1 }]), controller.uploadMyCCCD);
router.get("/roles", controller.getRoles);

router.get("/", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), validateQuery(userPaginationSchema), controller.getUsers);
router.post("/create-staff", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.createStaff);
router.get("/:id", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.getUserById);
router.patch("/:id", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), validateBody(updateUserByAdminSchema), controller.updateUserById);
router.delete("/:id", authorize(ROLES.CHU_NHA), controller.softDeleteUserById);

export default router;