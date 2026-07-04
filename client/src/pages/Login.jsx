import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // "password" | "otp"
  const [mode, setMode] = useState("password");

  // OTP flow state (email-only — Fast2SMS/mobile OTP needs KYC, skipping for now)
  const otpChannel = "email";
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState(1); // 1 = enter identifier, 2 = enter code
  const [otpInfo, setOtpInfo] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

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

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setOtpInfo("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setOtpInfo("");
    if (!otpIdentifier) {
      setError("Please enter your email");
      return;
    }
    setOtpBusy(true);
    try {
      await sendOtp(otpIdentifier, otpChannel);
      setOtpStep(2);
      setOtpInfo("If an account exists for this email, a 6-digit code has been sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpCode || otpCode.length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }
    try {
      await verifyOtp(otpIdentifier, otpChannel, otpCode);
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
          padding: 20px;
          box-sizing: border-box;
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
          max-width: 100%;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 0 80px rgba(108, 71, 255, 0.15), 0 30px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
        }

        @media (max-width: 480px) {
          .login-root { padding: 12px; }
          .login-card { padding: 32px 22px; border-radius: 18px; }
          .login-title { font-size: 26px; }
          .login-subtitle { margin-bottom: 26px; }
          .orb-1, .orb-2, .orb-3 { display: none; }
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

        .pass-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #a78bfa; }

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

        .mode-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .mode-tab {
          flex: 1;
          text-align: center;
          padding: 10px;
          border-radius: 9px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.45);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-tab.active {
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          color: #fff;
          box-shadow: 0 6px 16px rgba(108,71,255,0.35);
        }

        .channel-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
        }
        .channel-tab {
          flex: 1;
          text-align: center;
          padding: 9px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.2s;
        }
        .channel-tab.active {
          border-color: rgba(108,71,255,0.5);
          background: rgba(108,71,255,0.15);
          color: #c4b5fd;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(108, 71, 255, 0.1);
          border: 1px solid rgba(108,71,255,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #c4b5fd;
          font-size: 13px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .otp-input {
          letter-spacing: 8px;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
        }

        .resend-link {
          background: none;
          border: none;
          color: #a78bfa;
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          width: 100%;
          margin-top: 14px;
          padding: 4px;
        }
        .resend-link:hover { color: #c4b5fd; text-decoration: underline; }
        .resend-link:disabled { opacity: 0.5; cursor: not-allowed; }

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

          <div className="mode-tabs">
            <button
              type="button"
              className={`mode-tab ${mode === "password" ? "active" : ""}`}
              onClick={() => switchMode("password")}
            >
              Password
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === "otp" ? "active" : ""}`}
              onClick={() => switchMode("otp")}
            >
              Login with OTP
            </button>
          </div>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          {mode === "password" ? (
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
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none' }}>Forgot password?</Link>
                </div>
                <div className="field-input-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                  />
                  <span className="field-icon">🔒</span>
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass((s) => !s)}
                    tabIndex={-1}
                    title={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <><span className="loader" />Signing in...</> : "Sign in →"}
              </button>
            </form>
          ) : otpStep === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <div className="field-input-wrap">
                  <input
                    type="email"
                    value={otpIdentifier}
                    onChange={(e) => { setOtpIdentifier(e.target.value); setError(""); }}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                  <span className="field-icon">✉️</span>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={otpBusy}>
                {otpBusy ? <><span className="loader" />Sending code...</> : "Send OTP →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              {otpInfo && <div className="info-box">📩 {otpInfo}</div>}

              <div className="field-wrap">
                <label className="field-label">6-digit code</label>
                <div className="field-input-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    className="field-input otp-input"
                    placeholder="000000"
                    style={{ paddingLeft: 16 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <><span className="loader" />Verifying...</> : "Verify & Sign in →"}
              </button>

              <button
                type="button"
                className="resend-link"
                disabled={otpBusy}
                onClick={handleSendOtp}
              >
                Didn't get a code? Resend
              </button>

              <button
                type="button"
                className="resend-link"
                onClick={() => { setOtpStep(1); setOtpCode(""); setError(""); setOtpInfo(""); }}
              >
                Use a different email
              </button>
            </form>
          )}

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