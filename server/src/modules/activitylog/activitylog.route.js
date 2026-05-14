// server/src/modules/activitylog/activitylog.route.js

import express from "express";
import * as controller from "./activitylog.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA));

router.get("/",        controller.getLogs);
router.get("/stats",   controller.getStats);
router.post("/:id/undo", controller.undoLog);

export default router;
