import express from "express";
import * as controller from "./user.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../../middleware/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  updateMyProfileSchema,
  updateUserByAdminSchema,
  userPaginationSchema,
} from "./user.validation.js";

const router = express.Router();

router.use(protect);

router.get("/me", controller.getMe);
router.patch("/me", validateBody(updateMyProfileSchema), controller.updateMe);

router.get("/", authorize(ROLES.QUAN_LY), validateQuery(userPaginationSchema), controller.getUsers);
router.get("/:id", authorize(ROLES.QUAN_LY), controller.getUserById);
router.patch("/:id", authorize(ROLES.QUAN_LY), validateBody(updateUserByAdminSchema), controller.updateUserById);
router.delete("/:id", authorize(ROLES.QUAN_LY), controller.softDeleteUserById);

export default router;