import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Login({ toggleView }) {
  const { loginUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.status === "success") {
        loginUser(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Грешка при вход.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-emerald-400 mb-2">
          Вход за Учители
        </h2>
        <p className="text-xs text-center text-slate-400 mb-6">
          Влезте, за да генерирате тестове с ИИ
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Имейл адрес
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="teacher@school.bg"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Парола</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-700 text-slate-950 font-bold py-2.5 rounded-lg transition duration-200 cursor-pointer text-sm"
          >
            {loading ? "Проверка..." : "Влез в профила"}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6">
          Нямате профил?{" "}
          <button
            onClick={toggleView}
            className="text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Регистрирайте се безплатно
          </button>
        </p>
      </div>
    </div>
  );
}
