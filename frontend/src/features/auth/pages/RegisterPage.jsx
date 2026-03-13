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

  return (
    <div className={styles.page}>
      <div className={styles.logoRow}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="#258cf4" strokeWidth="2"/><path d="M16 10a4 4 0 01-8 0" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className={styles.logoText}>Luminary</span>
      </div>

      <h1 className={styles.title}>Create account</h1>
      <p className={styles.subtitle}>Join thousands of happy shoppers</p>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Full Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
