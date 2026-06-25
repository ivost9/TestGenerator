import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import GeneratedTest from "../models/GeneratedTest.js";

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Моля, въведете имейл и парола!" });
    }

    // Проверка дали потребителят вече съществува
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Този имейл вече е регистриран!" });
    }

    // Хеширане на паролата (сигурност на банково ниво)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Създаване на новия учител с 3 безплатни кредита
    const newUser = await User.create({
      email,
      passwordHash,
      credits: 3,
    });

    return res.status(201).json({
      status: "success",
      message: "Регистрацията е успешна! Вече можете да влезете в профила си.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Грешка при регистрация." });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Моля, въведете имейл и парола!" });
    }

    // Търсене на потребителя
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Грешен имейл или парола!" });
    }

    // Проверка на паролата
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Грешен имейл или парола!" });
    }

    // Генериране на JWT Токен (валиден 7 дни)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "super_secret_fallback_key",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      status: "success",
      message: "Успешен вход!",
      token,
      user: {
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Грешка при вход." });
  }
};

/**
 * GET /api/auth/me
 * Връща данните на текущо логнатия потребител (използва се при презареждане на сайта)
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Потребителят не е намерен." });
    }
    return res.status(200).json({ status: "success", user });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
export const getAdminStats = async (req, res) => {
  try {
    // Проверка дали текущият потребител наистина е админ
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Нямате админски права!" });
    }

    // Паралелно броене на потребителите и тестовете в MongoDB
    const totalUsers = await User.countDocuments();
    const totalTests = await GeneratedTest.countDocuments();

    return res.status(200).json({
      status: "success",
      stats: { totalUsers, totalTests },
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
