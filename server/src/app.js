import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import { setupSwagger } from "./config/swagger.js";
import prisma from "./config/prisma.js";

import authRoutes from "./modules/auth/auth.route.js";
import apartmentRoutes from "./modules/apartment/apartment.route.js";
import userRoutes from "./modules/user/user.route.js";

// Routes của cậu
import toanhaRoutes from "./modules/toanha/toanha.route.js";
import tienichRoutes from "./modules/tienich/tienich.route.js";
import taisanRoutes from "./modules/taisan/taisan.route.js";
import theguixeRoutes from "./modules/theguixe/theguixe.route.js";

// Billing workflow routes
import chisoRoutes from "./modules/chisodiennuoc/chisodiennuoc.route.js";
import hoadonRoutes from "./modules/hoadon/hoadon.route.js";

// Middleware xử lý lỗi (từ main)
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

const corsOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Swagger UI
setupSwagger(app);

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      success: true, 
      message: "Server OK, Database connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed: " + error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/users", userRoutes);

// Routes của cậu
app.use("/api/toanha", toanhaRoutes);
app.use("/api/tienich", tienichRoutes);
app.use("/api/taisan", taisanRoutes);
app.use("/api/theguixe", theguixeRoutes);

// Billing workflow routes
app.use("/api/chisodiennuoc", chisoRoutes);
app.use("/api/hoadon", hoadonRoutes);

// Error handling (LUÔN đặt cuối)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;