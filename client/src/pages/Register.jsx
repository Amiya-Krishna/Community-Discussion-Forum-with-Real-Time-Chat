import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", mobile: "" });
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      setError("All fields including mobile number are required");
      return;
    }
    if (formData.mobile.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await register(formData.name, formData.email, formData.password, formData.mobile);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const strengthScore = () => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = strengthScore();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#6c47ff", "#29ca57"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .reg-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 40px 20px;
        }
        .orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:.2; }
        .orb-a { width:600px;height:600px;background:#6c47ff;top:-200px;right:-200px;animation:driftA 12s ease-in-out infinite alternate; }
        .orb-b { width:400px;height:400px;background:#00e5ff;bottom:-100px;left:-100px;animation:driftB 9s ease-in-out infinite alternate; }
        @keyframes driftA { to{transform:translate(-20px,20px) scale(1.05)} }
        @keyframes driftB { to{transform:translate(20px,-30px) scale(1.08)} }

        .grid-bg {
          position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:50px 50px;
        }

        .reg-card {
          position:relative;z-index:10;width:460px;max-width:100%;box-sizing:border-box;
          background:rgba(255,255,255,0.035);
          backdrop-filter:blur(28px);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:28px;
          padding:48px 44px;
          box-shadow:0 0 100px rgba(108,71,255,0.12),0 40px 80px rgba(0,0,0,0.6);
          animation:rise 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @media (max-width: 480px) {
          .reg-root { padding: 16px 12px; }
          .reg-card { padding: 30px 20px; border-radius: 18px; }
          .orb-a, .orb-b { display: none; }
        }
        @keyframes rise { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }

        .reg-eyebrow {
          font-family:'Syne',sans-serif;font-size:11px;font-weight:700;
          letter-spacing:0.12em;text-transform:uppercase;
          color:#a78bfa;margin-bottom:10px;
          display:flex;align-items:center;gap:8px;
        }
        .reg-eyebrow::before{content:'';display:inline-block;width:20px;height:2px;background:#6c47ff;border-radius:2px;}

        .reg-title {
          font-family:'Syne',sans-serif;font-size:30px;font-weight:800;
          color:#fff;margin-bottom:4px;line-height:1.15;
        }
        .reg-sub { font-size:14px;color:rgba(255,255,255,0.35);margin-bottom:36px; }

        .field-row { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:0; }

        .field-wrap { margin-bottom:16px; }
        .field-label {
          display:block;font-size:11px;font-weight:500;
          letter-spacing:0.07em;text-transform:uppercase;
          color:rgba(255,255,255,0.4);margin-bottom:8px;
        }
        .field-input-wrap { position:relative; }
        .field-icon {
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          font-size:14px;color:rgba(255,255,255,0.2);pointer-events:none;transition:color 0.2s;
        }
        .field-input {
          width:100%;padding:13px 14px 13px 40px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:12px;color:#fff;
          font-family:'DM Sans',sans-serif;font-size:14px;
          outline:none;transition:all 0.25s;box-sizing:border-box;
        }
        .field-input::placeholder{color:rgba(255,255,255,0.18);}
        .field-input:focus{border-color:rgba(108,71,255,0.55);background:rgba(108,71,255,0.07);box-shadow:0 0 0 3px rgba(108,71,255,0.1);}
        .field-input:focus ~ .field-icon{color:#a78bfa;}
        .field-input-wrap:focus-within .field-icon{color:#a78bfa;}

        .pass-toggle {
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:16px;
          transition:color 0.2s;padding:0;
        }
        .pass-toggle:hover{color:#a78bfa;}

        .strength-bar {
          display:flex;gap:4px;margin-top:8px;
        }
        .strength-seg {
          flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,0.08);
          transition:background 0.4s;
        }

        .error-box {
          display:flex;align-items:flex-start;gap:10px;
          background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);
          border-radius:10px;padding:12px 14px;
          color:#fca5a5;font-size:13px;margin-bottom:18px;
          animation:shake 0.35s ease;
        }
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}

        .btn-reg {
          width:100%;padding:15px;
          background:linear-gradient(135deg,#6c47ff,#a855f7);
          border:none;border-radius:12px;color:#fff;
          font-family:'Syne',sans-serif;font-size:15px;font-weight:700;
          letter-spacing:0.02em;cursor:pointer;margin-top:6px;
          position:relative;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s;
        }
        .btn-reg:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 32px rgba(108,71,255,0.4);}
        .btn-reg:disabled{opacity:0.5;cursor:not-allowed;}
        .loader{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
        @keyframes spin{to{transform:rotate(360deg)}}

        .login-link{text-align:center;font-size:14px;color:rgba(255,255,255,0.3);margin-top:24px;}
        .login-link a{color:#a78bfa;text-decoration:none;font-weight:500;}
        .login-link a:hover{color:#c4b5fd;}

        .perks {
          display:flex;gap:6px;flex-wrap:wrap;margin-bottom:28px;
        }
        .perk {
          display:inline-flex;align-items:center;gap:5px;
          background:rgba(108,71,255,0.1);border:1px solid rgba(108,71,255,0.2);
          border-radius:100px;padding:4px 10px;
          font-size:11px;color:#a78bfa;font-weight:500;
        }
      `}</style>

      <div className="reg-root">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="grid-bg" />

        <div className="reg-card">
          <div className="reg-eyebrow">Create Account</div>
          <h1 className="reg-title">Join the<br />community ✦</h1>
          <p className="reg-sub">Fill in the details below to get started</p>

          <div className="perks">
            <span className="perk">✓ Free forever</span>
            <span className="perk">✓ No credit card</span>
            <span className="perk">✓ Instant access</span>
          </div>

          {error && <div className="error-box"><span>⚠️</span><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field-wrap">
                <label className="field-label">Full Name</label>
                <div className="field-input-wrap">
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="field-input" placeholder="Alex Johnson" />
                  <span className="field-icon">👤</span>
                </div>
              </div>
              <div className="field-wrap">
                <label className="field-label">Mobile</label>
                <div className="field-input-wrap">
                  <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="field-input" placeholder="+91 98765..." />
                  <span className="field-icon">📱</span>
                </div>
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Email Address</label>
              <div className="field-input-wrap">
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="field-input" placeholder="you@example.com" />
                <span className="field-icon">✉️</span>
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="field-input" placeholder="Min 6 characters" />
                <span className="field-icon">🔒</span>
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {formData.password && (
                <div>
                  <div className="strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="strength-seg" style={{ background: i <= strength ? strengthColor : undefined }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: strengthColor, marginTop: '5px', fontWeight: 600 }}>{strengthLabel}</div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-reg" disabled={loading}>
              {loading ? <><span className="loader" />Creating account...</> : "Create Account →"}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;