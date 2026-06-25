import { useState, useEffect } from "react";
import API from "../services/api";

export default function History() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get("/tests/my-tests");
        if (response.data.status === "success") {
          setTests(response.data.tests);
        }
      } catch (err) {
        console.error("Грешка при зареждане на историята:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
          📚 История на твоите тестове
        </h2>

        {loading && (
          <div className="text-center text-slate-400 py-12 animate-pulse">
            Зареждане на историята...
          </div>
        )}

        {!loading && tests.length === 0 && (
          <div className="text-center text-slate-500 italic py-12 bg-slate-800 rounded-xl border border-slate-700">
            Все още нямаш генерирани тестове. Създай първия си тест от менюто!
          </div>
        )}

        {!loading && tests.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-600 transition"
              >
                <div>
                  <h3 className="font-bold text-slate-200">
                    {test.subject} — {test.grade} клас
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    <span className="text-slate-500">Тема:</span> {test.topic}
                  </p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-2">
                    <span>
                      ⏱️ {new Date(test.createdAt).toLocaleDateString("bg-BG")}
                    </span>
                    <span>📊 Въпроси: {test.count}</span>
                    <span className="capitalize">
                      ⚙️{" "}
                      {test.difficulty === "easy"
                        ? "лесно"
                        : test.difficulty === "medium"
                          ? "средно"
                          : "трудно"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `http://localhost:5000/api/tests/${test._id}/pdf`,
                      "_blank",
                    )
                  }
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-950 text-amber-400 hover:text-amber-300 text-xs font-bold py-2 px-4 rounded-lg border border-slate-700 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🖨️ Свали PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
