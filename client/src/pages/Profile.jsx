import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { useState } from "react";

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEditMode(false);
      showToast("Profile updated successfully! ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(108,71,255,0.3)", borderTopColor: "#6c47ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        .prof-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: ${isDark ? "#050508" : "#f8f7ff"};
          position: relative;
          overflow-x: hidden;
        }

        .prof-orb-1 {
          position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none;
          width: 500px; height: 500px; background: rgba(108,71,255,0.12);
          top: -150px; right: -150px; z-index: 0;
        }

        .prof-main { max-width: 700px; margin: 0 auto; padding: 40px 24px; position: relative; z-index: 1; }

        .prof-hero {
          background: ${isDark ? "rgba(95, 92, 92, 0.21)" : "rgba(255,255,255,0.9)"};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.15)"};
          border-radius: 28px;
          overflow: hidden;
          box-shadow: ${isDark ? "0 0 80px rgba(108,71,255,0.1), 0 30px 60px rgba(0,0,0,0.4)" : "0 20px 60px rgba(108,71,255,0.1)"};
          animation: fadeIn 0.5s ease forwards;
        }

        .prof-banner {
          height: 120px;
          background: linear-gradient(135deg, #6c47ff 0%, #a855f7 50%, #00e5ff 100%);
          position: relative;
          overflow: hidden;
        }
        .prof-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          background-size: 60px 60px;
        }

        .prof-avatar-wrap {
          position: relative;
          margin-top: -44px;
          padding: 0 32px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .prof-avatar {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          border: 4px solid ${isDark ? "#050508" : "#f8f7ff"};
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800; color: #fff;
          box-shadow: 0 8px 24px rgba(108,71,255,0.4);
          flex-shrink: 0;
        }
        .prof-online {
          width: 16px; height: 16px;
          background: #10b981;
          border-radius: 50%;
          border: 3px solid ${isDark ? "#050508" : "#f8f7ff"};
          position: absolute; bottom: 4px; right: 4px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)}50%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}

        .prof-body { padding: 16px 32px 32px; }
        .prof-name {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 2px;
        }
        .prof-email-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: ${isDark ? "rgba(108,71,255,0.12)" : "rgba(108,71,255,0.08)"};
          border: 1px solid rgba(108,71,255,0.2);
          border-radius: 100px; padding: 4px 12px;
          font-size: 13px; color: #a78bfa; margin-bottom: 24px; margin-top: 8px;
        }

        .prof-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          border-radius: 16px; overflow: hidden; margin-bottom: 32px;
        }
        .stat-item {
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)"};
          padding: 16px; text-align: center;
        }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: ${isDark ? "#fff" : "#0f0a1e"}; }
        .stat-lbl { font-size: 11px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"}; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }

        .prof-section-title {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)"};
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .prof-section-title::after { content: ''; flex: 1; height: 1px; background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"}; }

        .field-wrap { margin-bottom: 16px; }
        .field-label {
          display: block; font-size: 11px; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.45)"}; margin-bottom: 7px;
        }
        .field-input-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"};
          pointer-events: none; transition: color 0.2s;
        }
        .field-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};
          border-radius: 12px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: all 0.25s; box-sizing: border-box;
        }
        .field-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.18)" : "rgba(15,10,30,0.25)"}; }
        .field-input:focus { border-color: rgba(108,71,255,0.5); background: rgba(108,71,255,0.07); box-shadow: 0 0 0 3px rgba(108,71,255,0.1); }
        .field-input:focus ~ .field-icon, .field-input-wrap:focus-within .field-icon { color: #a78bfa; }
        .field-input:disabled {
          opacity: 0.55; cursor: not-allowed;
          background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"};
        }

        .btn-row { display: flex; gap: 10px; margin-top: 8px; }
        .btn {
          padding: 12px 22px; border-radius: 10px; border: none;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 7px;
        }
        .btn-edit { background: linear-gradient(135deg, #6c47ff, #a855f7); color: #fff; }
        .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(108,71,255,0.4); }
        .btn-save { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
        .btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-cancel {
          background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"};
          color: ${isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.5)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"};
        }
        .btn-cancel:hover { background: ${isDark ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.09)"}; }
        .btn-logout { background: rgba(226, 20, 20, 0.89); color: #f1ecec; border: 1px solid rgba(239,68,68,0.2); margin-top: 24px; }
        .btn-logout:hover { background: rgba(209, 63, 63, 0.89); box-shadow: 0 6px 16px rgba(239,68,68,0.2); transform: translateY(-1px); }

        .divider { height: 1px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"}; margin: 28px 0; }

        .loader { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        .toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 999; animation: slideDown 0.35s ease;
          background: ${isDark ? "rgba(20,17,30,0.95)" : "rgba(255,255,255,0.97)"};
          backdrop-filter: blur(16px);
          border-radius: 100px; padding: 12px 20px;
          display: flex; align-items: center; gap: 10px;
          border: 1px solid rgba(16,185,129,0.25);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          font-size: 14px; font-weight: 500;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          white-space: nowrap;
        }
        .toast-error { border-color: rgba(239,68,68,0.25); }
      `}</style>

      <div className="prof-root">
        <div className="prof-orb-1" />

        <div className="prof-main">
          <div className="prof-hero">
            <div className="prof-banner" />

            <div className="prof-avatar-wrap">
              <div style={{ position: "relative" }}>
                <div className="prof-avatar">{getInitials(user.name)}</div>
                <div className="prof-online" />
              </div>
              {!editMode && (
                <button className="btn btn-edit" onClick={() => setEditMode(true)} style={{ marginBottom: "8px" }}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            <div className="prof-body">
              <div className="prof-name">{user.name || "User"}</div>
              <div className="prof-email-badge">✉️ {user.email}</div>

              <div className="prof-stats">
                <div className="stat-item">
                  <div className="stat-num">12</div>
                  <div className="stat-lbl">Posts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">48</div>
                  <div className="stat-lbl">Comments</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">7</div>
                  <div className="stat-lbl">Days Active</div>
                </div>
              </div>

              <div className="prof-section-title">Personal Information</div>

              <div className="field-wrap">
                <label className="field-label">Full Name</label>
                <div className="field-input-wrap">
                  <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editMode} className="field-input" placeholder="Your full name" />
                  <span className="field-icon">👤</span>
                </div>
              </div>

              <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <div className="field-input-wrap">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!editMode} className="field-input" placeholder="your@email.com" />
                  <span className="field-icon">✉️</span>
                </div>
              </div>

              <div className="field-wrap">
                <label className="field-label">Mobile Number</label>
                <div className="field-input-wrap">
                  <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} disabled={!editMode} className="field-input" placeholder="+91 98765 43210" />
                  <span className="field-icon">📱</span>
                </div>
              </div>

              {editMode && (
                <div className="btn-row">
                  <button className="btn btn-save" onClick={handleUpdate} disabled={saving}>
                    {saving ? <span className="loader" /> : "✓"} Save Changes
                  </button>
                  <button className="btn btn-cancel" onClick={() => {
                    setEditMode(false);
                    setFormData({ name: user?.name || "", email: user?.email || "", mobile: user?.mobile || "" });
                  }}>
                    ✗ Cancel
                  </button>
                </div>
              )}

              <div className="divider" />

              <button className="btn btn-logout" onClick={handleLogout}>
                 Sign Out
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : ""}`}>
            <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;