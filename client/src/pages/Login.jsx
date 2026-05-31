import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-800 to-blue-700">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl mb-4 font-bold">Login</h2>

        {error && <div className="mb-3 p-2 bg-red-600 text-white rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
            placeholder="Email"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-400">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;