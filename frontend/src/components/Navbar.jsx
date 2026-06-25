import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ setPage, currentPage }) {
  const { user, logoutUser } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Лого + Навигационни бутони */}
        <div className="flex items-center space-x-6">
          <span className="text-xl font-black tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-800/50">
            🤖 TestGen.AI
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage("generator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPage === "generator" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}
            >
              ➕ Нов тест
            </button>
            <button
              onClick={() => setPage("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPage === "history" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}
            >
              📚 Моите тестове
            </button>
          </div>
        </div>

        {/* Информация за профила и Кредити + Бутон за Изход */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 text-sm flex items-center gap-2">
            <span className="text-slate-400">Учител:</span>
            <span className="text-slate-200 font-medium">{user.email}</span>
            <span className="text-slate-600 mx-1">|</span>
            <span className="text-amber-400 font-bold">{user.credits} 🪙</span>
          </div>

          <button
            onClick={logoutUser}
            className="bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-semibold transition duration-200 cursor-pointer"
          >
            Изход 🚪
          </button>
        </div>
      </div>
    </nav>
  );
}
