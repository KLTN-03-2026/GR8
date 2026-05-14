import express from "express";
import * as vnpayController from "./vnpay.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post(
  "/create-payment/:invoiceId",
  authenticate,
  authorize(ROLES.NGUOI_THUE),
  vnpayController.createPayment,
);

router.get("/return", vnpayController.handleReturn);

export default router;
