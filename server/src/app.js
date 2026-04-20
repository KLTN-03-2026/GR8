import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import apartmentRoutes from "./modules/apartment/apartment.route.js";
import userRoutes from "./modules/user/user.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";
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

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/users", userRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;