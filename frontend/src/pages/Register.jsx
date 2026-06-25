import { useState } from "react";
import API from "../services/api";

export default function Register({ toggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/auth/register", { email, password });
      if (response.data.status === "success") {
        setSuccess(response.data.message);
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Грешка при регистрация.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-emerald-400 mb-2">
          Нова Регистрация
        </h2>
        <p className="text-xs text-center text-slate-400 mb-6">
          Вземете 3 безплатни кредита веднага
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
              placeholder="Минимум 6 символа"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded border border-emerald-900">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-700 text-slate-950 font-bold py-2.5 rounded-lg transition duration-200 cursor-pointer text-sm"
          >
            {loading ? "Създаване..." : "Създай профил"}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6">
          Вече имате профил?{" "}
          <button
            onClick={toggleView}
            className="text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Влезте оттук
          </button>
        </p>
      </div>
    </div>
  );
}
