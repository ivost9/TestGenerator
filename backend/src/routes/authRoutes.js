import express from "express";
import {
  register,
  login,
  getMe,
  getAdminStats,
} from "../controllers/authController.js"; // Добави getAdminStats
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/admin-stats", protect, getAdminStats); // <-- Новият админски маршрут

export default router;
