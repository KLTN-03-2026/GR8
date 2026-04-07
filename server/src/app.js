import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apartmentRoutes from "./modules/apartment/apartment.route.js";
import userRoutes from "./modules/user/user.route.js";
import authRoutes from "./modules/auth/auth.route.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/users", userRoutes);

export default app;