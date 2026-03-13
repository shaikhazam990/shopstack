import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../../store/authSlice";
import styles from "./AuthPage.module.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
      <div className={styles.logoRow}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="#258cf4" strokeWidth="2"/><path d="M16 10a4 4 0 01-8 0" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className={styles.logoText}>Luminary</span>
      </div>

      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your account</p>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div className={styles.field}>
          <label>
            Password
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
          </label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
};

export default LoginPage;
