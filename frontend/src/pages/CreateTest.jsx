import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { jsPDF } from "jspdf";

const MON_SUBJECTS_BY_GRADE = {
  5: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Човекът и природата",
    "Музика",
    "Изобразително изкуство",
    "Технологии и предприемачество",
  ],
  6: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Човекът и природата",
    "Музика",
    "Изобразително изкуство",
    "Технологии и предприемачество",
  ],
  7: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Биология и здравно образование",
    "Физика и астрономия",
    "Химия и опазване на околната среда",
    "Музика",
    "Изобразително изкуство",
    "Технологии и предприемачество",
  ],
  8: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Биология и здравно образование",
    "Физика и астрономия",
    "Химия и опазване на околната среда",
    "Философия",
    "Музика",
    "Изобразително изкуство",
  ],
  9: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Биология и здравно образование",
    "Физика и астрономия",
    "Химия и опазване на околната среда",
    "Философия",
  ],
  10: [
    "Български език и литература",
    "Математика",
    "Информационни технологии",
    "История и цивилизации",
    "География и икономика",
    "Биология и здравно образование",
    "Физика и астрономия",
    "Химия и опазване на околната среда",
    "Философия",
  ],
  11: [
    "Български език и литература",
    "Математика",
    "История и цивилизации",
    "География и икономика",
    "Биология и здравно образование",
    "Физика и астрономия",
    "Химия и опазване на околната среда",
    "Философия",
    "Гражданско образование",
  ],
  12: ["Български език и литература", "Математика", "Гражданско образование"],
};

export default function CreateTest() {
  const { user, updateCredits } = useContext(AuthContext);

  // Стейт за формата
  const [grade, setGrade] = useState("5");
  const [subject, setSubject] = useState(MON_SUBJECTS_BY_GRADE["5"][0]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);

  // Стейт за UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedTest, setGeneratedTest] = useState(null);

  // Стейт за Админ Статистика
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0 });

  // Автоматична смяна на предмета при избор на нов клас
  useEffect(() => {
    const availableSubjects = MON_SUBJECTS_BY_GRADE[grade] || [];
    if (availableSubjects.length > 0) {
      setSubject(availableSubjects[0]);
    }
  }, [grade]);

  // Зареждане на админ статистика в реално време, ако потребителят е админ
  const fetchAdminStats = async () => {
    if (user?.role === "admin") {
      try {
        const response = await API.get("/auth/admin-stats");
        if (response.data.status === "success") {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Грешка при зареждане на статистика:", err);
      }
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [user, generatedTest]); // Презарежда се и веднага след като генерираме нов тест!

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedTest(null);

    try {
      const response = await API.post("/tests/generate", {
        subject,
        grade: Number(grade),
        topic,
        difficulty,
        count: Number(count),
      });

      if (response.data.status === "success") {
        setGeneratedTest(response.data.test);
        // Обновяваме кредитите на екрана само ако не сме админ
        if (user?.role !== "admin") {
          updateCredits(response.data.remainingCredits);
        }
      }
    } catch (err) {
      console.error(err);

      // Взимаме оригиналното съобщение за грешка от бекенда
      const serverMessage = err.response?.data?.message || "";

      // Наш преводач за по-човешки съобщения
      if (
        serverMessage.includes("high demand") ||
        serverMessage.includes("503") ||
        serverMessage.includes("UNAVAILABLE")
      ) {
        setError(
          "🤖 Сървърите на изкуствения интелект в момента са претоварени. Моля, изчакайте 10-15 секунди и опитайте отново.",
        );
      } else if (
        serverMessage.includes("API key") ||
        serverMessage.includes("403")
      ) {
        setError(
          "🔑 Проблем с лиценза (API ключа) на изкуствения интелект. Моля, свържете се с администратор.",
        );
      } else if (serverMessage) {
        // Ако е нашата валидация за грешна тема, Gemini ще е пратил хубаво съобщение, показваме директно него
        setError(serverMessage);
      } else {
        // Обща грешка за мрежови проблеми
        setError(
          "🌐 Връзката със сървъра беше прекъсната. Моля, проверете интернета си и опитайте пак.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* АДМИНСКИ ПАНЕЛ СЪС СТАТИСТИКА */}
        {user?.role === "admin" && (
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-800 p-4 rounded-xl border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase text-emerald-400">
                👑 Админ Панел
              </h3>
              <p className="text-xs text-slate-400">
                Имате неограничени права за генериране
              </p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 text-center">
              <span className="block text-xs text-slate-400">
                Регистрирани учители
              </span>
              <span className="text-xl font-black text-slate-200">
                {stats.totalUsers}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 text-center">
              <span className="block text-xs text-slate-400">
                Общо генерирани тестове
              </span>
              <span className="text-xl font-black text-emerald-400">
                {stats.totalTests}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ФОРМА ЗА ПАРАМЕТРИ */}
          <div className="md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">
              Параметри на теста
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Клас
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                >
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      {g} клас
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Предмет
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                >
                  {(MON_SUBJECTS_BY_GRADE[grade] || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Конкретна тема
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                  placeholder="напр. Релеф на Африка"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Трудност
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                >
                  <option value="easy">Лесно (Базово)</option>
                  <option value="medium">Средно</option>
                  <option value="hard">Трудно (За отличници)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Брой въпроси
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-900">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-700 text-slate-950 font-bold py-2 px-4 rounded-lg transition duration-200 cursor-pointer text-sm"
              >
                {loading
                  ? "🤖 Генериране..."
                  : user?.role === "admin"
                    ? "Генерирай като Админ (Безплатно)"
                    : "Създай тест (1 кредит)"}
              </button>
            </form>
          </div>

          {/* ПРЕДВАРИТЕЛЕН ПРЕГЛЕД НА РЕЗУЛТАТА */}
          <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 min-h-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-slate-200 pb-2 border-b border-slate-700">
              Предварителен преглед
            </h2>

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 animate-pulse">
                  Gemini съставя въпросите по МОН стандарти...
                </p>
              </div>
            )}

            {!loading && !generatedTest && (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm italic">
                Изберете параметри и натиснете бутона, за да видите въпросите
                тук.
              </div>
            )}

            {!loading && generatedTest && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-slate-300">
                      {generatedTest.subject} — {generatedTest.grade} клас
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Тема: {generatedTest.topic}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/api/tests/${generatedTest._id}/pdf`,
                        "_blank",
                      )
                    }
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 px-4 rounded transition cursor-pointer"
                  >
                    🖨️ Свали готов PDF
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedTest.rawQuestions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-slate-900/60 p-4 rounded-lg border border-slate-700"
                    >
                      <p className="text-sm font-semibold text-slate-200 mb-3">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-xs border ${optIndex === q.correctAnswerIndex ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-medium" : "bg-slate-800/40 border-slate-700 text-slate-400"}`}
                          >
                            {String.fromCharCode(1040 + optIndex)}) {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-amber-400/80 mt-3 bg-amber-950/20 p-2 rounded border border-amber-900/30 italic">
                          💡 Обяснение за учителя: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
