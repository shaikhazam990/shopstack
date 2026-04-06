import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../../../store/authSlice";
import styles from "./AuthPage.module.css";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    dispatch(clearError());
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(register(form));
    setLoading(false);
    if (result.meta.requestStatus === "fulfilled") navigate("/");
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>Luminary</span>
        </div>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join thousands of happy shoppers</p>

        {error && (
          <div className={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} className={styles.input} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {/* Password strength */}
            {form.password.length > 0 && (
              <div className={styles.strengthRow}>
                <div className={styles.strengthBars}>
                  {[1,2,3].map(i => (
                    <div key={i} className={styles.strengthBar}
                      style={{ background: strength >= i ? strengthColor[strength] : "#e5e7eb" }} />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : "Create Account"}
          </button>
        </form>

        <p className={styles.terms}>
          By creating an account you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
        </p>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;