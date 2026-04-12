import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { authMiddleware } from "./Middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_URL = process.env.FRONTENDURL || "https://group28finalproject.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});