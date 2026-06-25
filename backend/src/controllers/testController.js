import { generateTestQuestions } from "../services/geminiService.js"; //  Трябва да има .js
import GeneratedTest from "../models/GeneratedTest.js"; //  Трябва да има .js
import User from "../models/User.js";
import { generateTestPDF } from "../services/pdfService.js";

/**
 * POST /api/tests/generate
 * Генерира нов тест чрез ИИ, записва го в базата и хаби 1 кредит.
 */
export const createTest = async (req, res) => {
  try {
    const { subject, grade, topic, difficulty, count } = req.body;

    // 1. Валидация на входящите данни от фронтенда
    if (!subject || !grade || !topic || !difficulty) {
      return res
        .status(400)
        .json({ status: "error", message: "Всички полета са задължителни!" });
    }

    // === 🌟 СМЕНЯМЕ НА let ТУК, ЗА ДА МОЖЕ ДА СЕ ПРЕЗАПИСВА 🌟 ===
    let user = await User.findById(req.user.userId);

    // Ако потребителят липсва (и искаш да създадеш служебен)
    if (!user) {
      user = await User.create({
        email: "test_teacher@School.bg",
        passwordHash: "dummyhash123",
        credits: 5,
      });
      console.log("👤 Създаден е служебен тестов учител в базата данни.");
    }

    // 3. Проверка за налични кредити
    if (user.role !== "admin" && user.credits <= 0) {
      return res.status(403).json({
        status: "error",
        message: "Нямате оставащи кредити!",
      });
    }

    // 4. Извикване на ИИ Сървиса (Gemini) за генериране на въпросите
    const questions = await generateTestQuestions({
      subject,
      grade,
      topic,
      difficulty,
      count,
    });

    // 5. Запис на генерирания тест в MongoDB Atlas
    const newTest = await GeneratedTest.create({
      userId: user._id,
      subject,
      grade,
      topic,
      difficulty,
      rawQuestions: questions,
    });

    // 6. Отнемане на 1 кредит от баланса на учителя
    if (user.role !== "admin") {
      user.credits -= 1;
      await user.save();
    }

    // 7. Връщане на успешния резултат към фронтенда
    return res.status(201).json({
      status: "success",
      message: "Тестът е генериран и записан успешно!",
      remainingCredits: user.credits,
      test: newTest,
    });
  } catch (error) {
    console.error("❌ ПЪЛНА ГРЕШКА В testController:", error); // Сложи го така, за да виждаш всичко в Render logs

    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
/**
 * GET /api/tests/:id/pdf
 * Взима теста от базата и генерира PDF on-the-fly
 */
export const downloadTestPDF = async (req, res) => {
  try {
    const test = await GeneratedTest.findById(req.params.id);
    if (!test) {
      return res
        .status(404)
        .json({ status: "error", message: "Тестът не е намерен!" });
    }

    // Извикваме PDF генератора
    generateTestPDF(test, res);
  } catch (error) {
    console.error("❌ Грешка при сваляне на PDF:", error.message);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
/**
 * GET /api/tests/my-tests
 * Връща история от тестове за конкретния учител
 */
export const getMyTests = async (req, res) => {
  try {
    // Намираме всички тестове, където userId съвпада с логнатия потребител
    // Сортираме ги по дата на създаване (най-новите първо)
    const tests = await GeneratedTest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("subject grade topic difficulty count createdAt"); // Спестяваме трафик, като не дърпаме въпросите още тук

    return res.status(200).json({ status: "success", tests });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
