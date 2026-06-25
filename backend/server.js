import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import testRoutes from "./src/routes/testRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

// 1. Зареждане на системните променливи от .env файла
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Глобални Middleware-и за сигурност и парсване
app.use(
  cors({
    origin: "http://localhost:5173", // Позволява достъп само на твоя React фронтенд (Vite)
    credentials: true,
  }),
);
app.use(express.json()); // Автоматично парсва входящите заявки с JSON боди
app.use("/api/tests", testRoutes);
app.use("/api/auth", authRoutes);
// 3. Базов Здравен Маршрут (Health Check Endpoint)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Бекенд сървърът на TestGenerator работи успешно!",
    timestamp: new Date(),
  });
});

// 4. Свързване с MongoDB Atlas Облачна База Данни
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("Липсва MONGO_URI в .env файла!");
    }

    await mongoose.connect(mongoURI);
    console.log("🍃 Успешно свързване с ОBLAЧНАТА база данни MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Грешка при връзка с MongoDB:", error.message);
    process.exit(1); // Спираме процеса, ако не можем да се вържем с базата на този етап
  }
};

// Извикване на функцията за връзка с базата
connectDB();

// 5. Глобален Middleware за улавяне на неочаквани системни грешки (Error Handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Възникна вътрешна системна грешка в сървъра.",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 6. Стартиране на Express сървъра
app.listen(PORT, () => {
  console.log(`🚀 Сървърът е онлайн на адрес: http://localhost:${PORT}`);
  console.log("⚙️  Режим на разработка: Активен (Nodemon)");
});
