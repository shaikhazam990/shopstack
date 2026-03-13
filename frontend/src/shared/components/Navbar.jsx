import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleCart } from "../../features/cart/cartSlice";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itemCount } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#258cf4" strokeWidth="2"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#258cf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Luminary</span>
        </Link>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => navigate("/search")} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>

          <button className={styles.iconBtn} onClick={() => dispatch(toggleCart())} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>

          {user ? (
            <Link to="/profile" className={styles.avatar}>
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name[0].toUpperCase()}
            </Link>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
