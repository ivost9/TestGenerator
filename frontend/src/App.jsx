import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import CreateTest from "./pages/CreateTest";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import History from "./pages/History"; // Импортираме историята

function App() {
  const { user, loading } = useContext(AuthContext);
  const [view, setView] = useState("login");
  const [page, setPage] = useState("generator"); // 'generator' или 'history'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Ако потребителят е логнат
  if (user) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Подаваме setPage на Navbar-а, за да може бутоните там да сменят страниците */}
        <Navbar setPage={setPage} currentPage={page} />

        {/* Динамично показваме или Генератора, или Историята */}
        {page === "generator" ? <CreateTest /> : <History />}
      </div>
    );
  }

  return view === "login" ? (
    <Login toggleView={() => setView("register")} />
  ) : (
    <Register toggleView={() => setView("login")} />
  );
}

export default App;
