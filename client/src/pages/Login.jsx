import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: drift 8s ease-in-out infinite alternate;
        }
        .orb-1 { width: 500px; height: 500px; background: #6c47ff; top: -100px; left: -150px; animation-duration: 10s; }
        .orb-2 { width: 400px; height: 400px; background: #00e5ff; bottom: -120px; right: -100px; animation-duration: 7s; }
        .orb-3 { width: 300px; height: 300px; background: #ff3cac; top: 40%; left: 50%; transform: translate(-50%, -50%); animation-duration: 12s; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -20px) scale(1.05); }
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 420px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 0 80px rgba(108, 71, 255, 0.15), 0 30px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(108, 71, 255, 0.15);
          border: 1px solid rgba(108, 71, 255, 0.3);
          border-radius: 100px;
          padding: 6px 14px;
          margin-bottom: 28px;
        }
        .brand-dot {
          width: 8px; height: 8px;
          background: #6c47ff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(108,71,255,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(108,71,255,0); }
        }
        .brand-text {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #a78bfa;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .login-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 36px;
        }

        .field-wrap {
          margin-bottom: 18px;
          position: relative;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .field-input-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          font-size: 16px;
          transition: color 0.2s;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.25s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-input:focus {
          border-color: rgba(108,71,255,0.6);
          background: rgba(108,71,255,0.08);
          box-shadow: 0 0 0 4px rgba(108,71,255,0.1);
        }
        .field-input:focus + .field-icon, .field-input-wrap:focus-within .field-icon {
          color: #a78bfa;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 20px;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .btn-login {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-login::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(108,71,255,0.4);
        }
        .btn-login:hover::before { opacity: 1; }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-login:active:not(:disabled) { transform: translateY(0); }

        .loader {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider-text { font-size: 12px; color: rgba(255,255,255,0.25); }

        .register-link {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.35);
        }
        .register-link a {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .register-link a:hover { color: #c4b5fd; text-decoration: underline; }

        .floating-label {
          position: absolute;
          left: 44px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          font-size: 15px;
          pointer-events: none;
          transition: all 0.2s;
        }
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg" />

        <div className="login-card">
          <div className="brand-badge">
            <span className="brand-dot" />
            <span className="brand-text">Secure Portal</span>
          </div>

          <h1 className="login-title">Welcome<br />back 👋</h1>
          <p className="login-subtitle">Sign in to continue to your account</p>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-wrap">
              <label className="field-label">Email Address</label>
              <div className="field-input-wrap">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="you@example.com"
                />
                <span className="field-icon">✉️</span>
              </div>
            </div>

            <div className="field-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label">Password</label>
                <a href="#" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div className="field-input-wrap">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="••••••••"
                />
                <span className="field-icon">🔒</span>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <><span className="loader" />Signing in...</> : "Sign in →"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">OR</span>
            <div className="divider-line" />
          </div>

          <p className="register-link">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;