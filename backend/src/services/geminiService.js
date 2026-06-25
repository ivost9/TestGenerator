import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Логваме дължината на ключа в Render конзолата, за да сме сигурни, че се чете
console.log(
  "ℹ️ Проверка на ключа при стартиране. Дължина:",
  process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.length
    : "ПРАЗЕН (undefined)",
);

// Новото SDK изисква обекта с apiKey да бъде подаден точно така.
// Ако процесът в Render по някаква причина не го намери, хвърляме грешка веднага.
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "❌ КРИТИЧНО: Липсва GEMINI_API_KEY в системните променливи на Render!",
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() }); // .trim() чисти скрити интервали!

export const generateTestQuestions = async ({
  subject,
  grade,
  topic,
  difficulty,
  count = 10,
}) => {
  try {
    // 1. Дефинираме разширена JSON схема, която включва валидация на темата
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isValidTopic: {
          type: Type.BOOLEAN,
          description:
            "Върни true, ако темата е реална, образователна и има логическа връзка с учебния предмет. Върни false, ако темата е очевидна глупост, спам, нецензурна или няма абсолютно нищо общо с предмета.",
        },
        validationMessage: {
          type: Type.STRING,
          description:
            "Ако isValidTopic е false, напиши кратко, учтиво съобщение на български защо темата е отхвърлена. Ако е true, остави го празно.",
        },
        questions: {
          type: Type.ARRAY,
          description:
            "Списък от изпитни въпроси. Генерирай ги САМО ако isValidTopic е true. Ако е false, върни празен масив.",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Текстът на самия въпрос на български език.",
              },
              options: {
                type: Type.ARRAY,
                description: "Точно 4 възможни опции за отговор.",
                items: { type: Type.STRING },
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "Индексът на правилния отговор (0 до 3).",
              },
              explanation: {
                type: Type.STRING,
                description: "Кратко обяснение защо този отговор е правилен.",
              },
            },
            required: [
              "question",
              "options",
              "correctAnswerIndex",
              "explanation",
            ],
          },
        },
      },
      required: ["isValidTopic", "validationMessage", "questions"],
    };

    // 2. Промпт със строги инструкции за филтриране на "щуротии"
    const prompt = `
      Ти си висококвалифициран български учител и експерт по сигурността на съдържанието.
      Трябва да съставиш официален училищен тест по следните параметри:
      - Предмет: ${subject}
      - Клас: ${grade} клас
      - Конкретна Тема/Раздел: ${topic}
      - Трудност: ${difficulty}
      - Брой въпроси: ${count}
      
      КРИТИЧНА СТЪПКА ЗА ВАЛИДАЦИЯ:
      Преди да генерираш каквото и да е, провери темата: "${topic}".
      Ако потребителят е написал пълни глупости, готварски рецепти, обиди, кодове, спам или тема, която по никакъв начин НЕ СЕ изучава по предмета "${subject}" в училище, заложи "isValidTopic": false и обясни защо в "validationMessage".
      Пример: Предмет "Математика", а тема "как се прати кола" ->isValidTopic: false.
    `;

    console.log(
      `🤖 Извикване на Gemini с умна валидация за тема: "${topic}"...`,
    );

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Сваляме температурата още малко за максимална стриктност
      },
    });

    const result = JSON.parse(response.text);

    // Ако ИИ е маркирал темата като невалидна, хвърляме грешка с неговото съобщение
    if (!result.isValidTopic) {
      throw new Error(
        result.validationMessage ||
          `Темата "${topic}" не съответства на предмета ${subject}.`,
      );
    }

    // Връщаме само масива с въпросите, ако всичко е наред
    return result.questions;
  } catch (error) {
    console.error("❌ Грешка в geminiService:", error.message);
    throw error; // Препращаме грешката нагоре към контролера
  }
};
