import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { setupSwagger } from "./config/swagger.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./modules/auth/auth.route.js";
import apartmentRoutes from "./modules/apartment/apartment.route.js";
import userRoutes from "./modules/user/user.route.js";
import toanhaRoutes from "./modules/toanha/toanha.route.js";
import tienichRoutes from "./modules/tienich/tienich.route.js";
import taisanRoutes from "./modules/taisan/taisan.route.js";
import theguixeRoutes from "./modules/theguixe/theguixe.route.js";
import yeuCauThueRoute from "./modules/yeucauthue/yeucauthue.route.js";
import hopdongRoute from "./modules/hopdong/hopdong.route.js";
import chuyennhuongRoute from "./modules/chuyennhuong/chuyennhuong.route.js";

dotenv.config();

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

// Swagger
setupSwagger(app);

// Routes
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/toanha", toanhaRoutes);
app.use("/api/tienich", tienichRoutes);
app.use("/api/taisan", taisanRoutes);
app.use("/api/theguixe", theguixeRoutes);
app.use("/api/yeucauthue", yeuCauThueRoute);
app.use("/api/hopdong", hopdongRoute);
app.use("/api/chuyennhuong", chuyennhuongRoute);

// Middleware xử lý lỗi (LUÔN để cuối)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;