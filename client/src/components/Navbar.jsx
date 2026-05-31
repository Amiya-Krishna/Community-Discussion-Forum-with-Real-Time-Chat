import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getInitials } from "../utils/getInitials";
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-b p-4 flex justify-between items-center`}>
      <div className="flex items-center gap-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Community Forum
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-3 py-1 rounded font-medium ${isDark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Posts
          </button>
          <button
            onClick={() => navigate("/chat")}
            className={`px-3 py-1 rounded font-medium ${isDark ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-500 text-white hover:bg-purple-600"}`}
          >
            💬 Messages
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`px-3 py-2 rounded ${isDark ? "bg-yellow-600 text-white hover:bg-yellow-700" : "bg-gray-700 text-yellow-300 hover:bg-gray-800"}`}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`px-3 py-1 rounded font-medium ${isDark ? "bg-green-600 text-white hover:bg-green-700" : "bg-green-500 text-white hover:bg-green-600"}`}
        >
          👤 {getInitials(user?.name)}
        </button>

        <button
          onClick={handleLogout}
          className={`px-3 py-1 rounded font-medium ${isDark ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"}`}
        >
          Logout
        </button>
      </div>
    </div>
  );
}