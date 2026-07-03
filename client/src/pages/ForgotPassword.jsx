import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email");
      return;
    }
    try {
      await forgotPassword(email);
      setSent(true);
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
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.25; animation: drift 8s ease-in-out infinite alternate; }
        .orb-1 { width: 500px; height: 500px; background: #6c47ff; top: -100px; left: -150px; animation-duration: 10s; }
        .orb-2 { width: 400px; height: 400px; background: #00e5ff; bottom: -120px; right: -100px; animation-duration: 7s; }
        .orb-3 { width: 300px; height: 300px; background: #ff3cac; top: 40%; left: 50%; transform: translate(-50%, -50%); animation-duration: 12s; }
        @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, -20px) scale(1.05); } }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 50px 50px; }

        .login-card {
          position: relative; z-index: 10; width: 420px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
          padding: 48px 40px; box-shadow: 0 0 80px rgba(108, 71, 255, 0.15), 0 30px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .brand-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(108, 71, 255, 0.15); border: 1px solid rgba(108, 71, 255, 0.3); border-radius: 100px; padding: 6px 14px; margin-bottom: 28px; }
        .brand-dot { width: 8px; height: 8px; background: #6c47ff; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(108,71,255,0.4); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(108,71,255,0); } }
        .brand-text { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #a78bfa; letter-spacing: 0.08em; text-transform: uppercase; }

        .login-title { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 6px; }
        .login-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 32px; }

        .field-wrap { margin-bottom: 18px; position: relative; }
        .field-label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
        .field-input-wrap { position: relative; }
        .field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); font-size: 16px; pointer-events: none; }
        .field-input { width: 100%; padding: 14px 16px 14px 44px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; transition: all 0.25s; box-sizing: border-box; }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-input:focus { border-color: rgba(108,71,255,0.6); background: rgba(108,71,255,0.08); box-shadow: 0 0 0 4px rgba(108,71,255,0.1); }

        .error-box { display: flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 14px; color: #fca5a5; font-size: 13px; margin-bottom: 20px; }
        .success-box { display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 14px; color: #6ee7b7; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }

        .btn-login { width: 100%; padding: 15px; background: linear-gradient(135deg, #6c47ff, #a855f7); border: none; border-radius: 12px; color: #fff; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; margin-top: 8px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(108,71,255,0.4); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .loader { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .register-link { text-align: center; font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 24px; }
        .register-link a { color: #a78bfa; text-decoration: none; font-weight: 500; }
        .register-link a:hover { color: #c4b5fd; text-decoration: underline; }
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

          <h1 className="login-title">Forgot your<br />password? 🔑</h1>
          <p className="login-subtitle">
            Enter your account email and we'll send you a link to reset it.
          </p>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          {sent ? (
            <div className="success-box">
              ✅ If an account exists for <strong>{email}</strong>, a password
              reset link has been sent. Check your inbox (and spam folder).
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <div className="field-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                  <span className="field-icon">✉️</span>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <><span className="loader" />Sending...</> : "Send reset link →"}
              </button>
            </form>
          )}

          <p className="register-link">
            Remembered your password? <Link to="/">Back to sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
