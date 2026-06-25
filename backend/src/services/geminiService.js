import { GoogleGenerativeAI } from "@google/generative-ai"; // 🌟 Използваме стабилното SDK
import dotenv from "dotenv";

dotenv.config();

export const generateTestQuestions = async ({
  subject,
  grade,
  topic,
  difficulty,
  count = 10,
}) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Липсва валиден API ключ в системата на Render (GEMINI_API_KEY).",
      );
    }

    // Инициализираме по доказания метод
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Взимаме модела и му казваме, че ИСКАМЕ JSON изход
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Ти си висококвалифициран български учител.
      Състави официален училищен тест в JSON формат по следните параметри:
      - Предмет: ${subject}
      - Клас: ${grade} клас
      - Конкретна Тема/Раздел: ${topic}
      - Трудност: ${difficulty}
      - Брой въпроси: ${count}

      КРИТИЧНА СТЪПКА ЗА ВАЛИДАЦИЯ:
      Преди да генерираш каквото и да е, провери темата: "${topic}".
      Ако потребителят е написал пълни глупости, готварски рецепти, обиди, кодове, спам или тема, която по никакъв начин НЕ СЕ изучава по предмета "${subject}" в училище, заложи "isValidTopic": false и обясни защо в "validationMessage".

      Върни ТОЧНО JSON обект със следната структура:
      {
        "isValidTopic": true,
        "validationMessage": "",
        "questions": [
          {
            "question": "Текст на въпроса на български",
            "options": ["Опция 1", "Опция 2", "Опция 3", "Опция 4"],
            "correctAnswerIndex": 0,
            "explanation": "Кратко обяснение защо отговорът е верен"
          }
        ]
      }
    `;

    console.log(`🤖 Извикване на Стабилното Gemini за тема: "${topic}"...`);

    const response = await model.generateContent(prompt);

    // Взимаме текста от отговора на стабилното SDK
    const responseText = response.response.text();
    const result = JSON.parse(responseText);

    if (!result.isValidTopic) {
      throw new Error(
        result.validationMessage || `Темата не съответства на предмета.`,
      );
    }

    return result.questions;
  } catch (error) {
    console.error("❌ Грешка в самите изчисления на geminiService:", error);
    throw error;
  }
};
