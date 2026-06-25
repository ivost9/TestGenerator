import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Проверка при първоначално зареждане на сайта (има ли токен?)
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Викаме ендпоинта /me, който е защитен
      const response = await API.get("/auth/me");
      if (response.data.status === "success") {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Невалиден токен, изчистване на сесията.");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Функция за Вход (Вкарва токена в паметта)
  const loginUser = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // 3. Функция за Изход (Изтрива всичко)
  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 4. Функция за ръчно обновяване на кредитите (след тест)
  const updateCredits = (newCredits) => {
    setUser((prev) => (prev ? { ...prev, credits: newCredits } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, loginUser, logoutUser, updateCredits, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
