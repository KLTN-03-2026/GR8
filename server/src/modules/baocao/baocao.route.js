import express from "express";
import * as baocaoController from "./baocao.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.QUAN_LY, ROLES.CHU_NHA));

router.get("/overview", baocaoController.getOverviewStats);
router.get("/revenue-chart", baocaoController.getRevenueChart);
router.get("/occupancy", baocaoController.getOccupancyRate);

export default router;
