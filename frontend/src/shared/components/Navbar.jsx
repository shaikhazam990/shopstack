import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleCart } from "../../store/cartSlice";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Explore" },
  { to: "/wishlist", label: "Wishlist" },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itemCount } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>Luminary</span>
        </Link>

        {/* Center Nav */}
        <nav className={styles.navLinks}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              {label}
              <span className={styles.navUnderline} />
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => navigate("/search")} aria-label="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <button className={styles.cartBtn} onClick={() => dispatch(toggleCart())} aria-label="Cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className={styles.cartLabel}>Cart</span>
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount > 99 ? "99+" : itemCount}</span>
            )}
          </button>

          {user ? (
            <Link to="/profile" className={styles.avatar} title={user.name}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{user.name[0].toUpperCase()}</span>}
              <span className={styles.avatarOnline} />
            </Link>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;