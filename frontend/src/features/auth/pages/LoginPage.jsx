import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, googleLogin, clearError } from "../../../store/authSlice";
import styles from "./AuthPage.module.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || "/";
  const googleBtnRef = useRef(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google?.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline", size: "large", width: "100%",
        text: "continue_with", shape: "rectangular",
      });
    };
    if (window.google) { initGoogle(); }
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = initGoogle;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    const result = await dispatch(googleLogin(response.credential));
    if (result.meta.requestStatus === "fulfilled") navigate(from, { replace: true });
  };

  const handleChange = (e) => {
    dispatch(clearError());
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(login(form));
    setLoading(false);
    if (result.meta.requestStatus === "fulfilled") navigate(from, { replace: true });
  };

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

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue shopping</p>

        {/* Google Button */}
        <div ref={googleBtnRef} className={styles.googleBtn} />

        <div className={styles.divider}><span>or continue with email</span></div>

        {error && (
          <div className={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required className={styles.input} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : "Sign In"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link to="/register" className={styles.switchLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;