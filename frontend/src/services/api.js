import axios from "axios";

// Създаваме инстанция на axios с базов URL адреса на нашия Express сървър
const API = axios.create({
  baseURL:
    "https://testgenerator-2yr0.onrender.com" || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Автоматичен интерцептор, който ще прикачва JWT токена към всяка заявка (когато направим Auth)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
