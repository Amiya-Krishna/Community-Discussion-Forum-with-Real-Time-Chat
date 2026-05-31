import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useState } from "react";

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put("/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div
        className={`${
          isDark ? "bg-gray-900" : "bg-white"
        } min-h-screen flex items-center justify-center`}
      >
        <p className={isDark ? "text-white" : "text-gray-900"}>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        isDark
          ? "bg-gradient-to-br from-gray-900 to-black"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      } min-h-screen`}
    >
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto mt-6">
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border rounded-lg p-8`}
        >
          <h1
            className={`text-3xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            My Profile
          </h1>

          <div className="space-y-4">
            {/* NAME */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded border ${
                  editMode
                    ? isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                    : isDark
                    ? "bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded border ${
                  editMode
                    ? isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                    : isDark
                    ? "bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* MOBILE */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Mobile Number
              </label>

              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded border ${
                  editMode
                    ? isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                    : isDark
                    ? "bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 mt-8">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                >
                  ✓ Save Changes
                </button>

                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      mobile: user?.mobile || "",
                    });
                  }}
                  className={`px-6 py-2 rounded font-medium ${
                    isDark
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  }`}
                >
                  ✗ Cancel
                </button>
              </>
            )}
          </div>

          <hr
            className={`my-8 ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
          />

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;