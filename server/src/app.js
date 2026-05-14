import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import passport from "./config/passport.js";

import { setupSwagger } from "./config/swagger.js";
import prisma from "./config/prisma.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { activityLogger } from "./middleware/activitylog.middleware.js";

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
import dichvuRoutes from "./modules/dichvu/dichvu.route.js";
import thanhvienRoutes from "./modules/thanhvien/thanhvien.route.js";
import yeucaudichvuRoutes from "./modules/yeucaudichvu/yeucaudichvu.route.js";

// Billing workflow routes
import chisoRoutes from "./modules/chisodiennuoc/chisodiennuoc.route.js";
import hoadonRoutes from "./modules/hoadon/hoadon.route.js";

// Additional features routes
import baocaoRoutes from "./modules/baocao/baocao.route.js";
import thongbaoRoutes from "./modules/thongbao/thongbao.route.js";
import chatbotRoutes from "./modules/chatbot/chatbot.route.js";
import vnpayRoutes from "./modules/vnpay/vnpay.route.js";
import yeucausucoRoutes from "./modules/yeucausuco/yeucausuco.route.js";
import tinnhanhethongRoutes from "./modules/tinnhanhethong/tinnhanhethong.route.js";
import activitylogRoutes from "./modules/activitylog/activitylog.route.js";
import lichtrucRoutes from "./modules/lichtruc/lichtruc.route.js";

const app = express();

// Render chạy sau reverse proxy — cần trust proxy để rate-limit hoạt động đúng
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Cho phép tất cả subdomain của vercel.app (preview deployments)
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(activityLogger);

// Session (cần cho Passport OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Cloudinary được sử dụng cho upload file, không cần static file serve
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "../uploads"), {
//     maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
//   })
// );

// Swagger
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
app.use("/api/toanha", toanhaRoutes);
app.use("/api/tienich", tienichRoutes);
app.use("/api/taisan", taisanRoutes);
app.use("/api/theguixe", theguixeRoutes);
app.use("/api/yeucauthue", yeuCauThueRoute);
app.use("/api/hopdong", hopdongRoute);
app.use("/api/chuyennhuong", chuyennhuongRoute);
app.use("/api/dichvu", dichvuRoutes);
app.use("/api/yeucaudichvu", yeucaudichvuRoutes);
app.use("/api/thanhvien", thanhvienRoutes);

// Billing workflow routes
app.use("/api/chisodiennuoc", chisoRoutes);
app.use("/api/hoadon", hoadonRoutes);
app.use("/api/vnpay", vnpayRoutes);

// Additional features routes
app.use("/api/baocao", baocaoRoutes);
app.use("/api/thongbao", thongbaoRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/yeucausuco", yeucausucoRoutes);
app.use("/api/tinnhanhethong", tinnhanhethongRoutes);
app.use("/api/activitylog", activitylogRoutes);
app.use("/api/lichtruc", lichtrucRoutes);


// Error handling (LUÔN đặt cuối)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
