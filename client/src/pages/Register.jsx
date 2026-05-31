import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",   // ✅ FIX: added mobile
  });

  const [error, setError] = useState("");
  const { register, loading } = useAuth();
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

    // ✅ FIX: include mobile validation
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      setError("All fields including mobile number are required");
      return;
    }

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.mobile
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-800 to-purple-700">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl mb-4 font-bold">Register</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-600 text-white rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
            placeholder="Name"
          />

          {/* MOBILE */}
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
            placeholder="Mobile Number"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
            placeholder="Email"
          />

          {/* PASSWORD */}
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
            className="w-full bg-green-600 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;