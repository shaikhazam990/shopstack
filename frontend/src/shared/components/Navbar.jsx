import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleCart } from "../../store/cartSlice";
import { logout } from "../../store/authSlice";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/",         label: "Home",    end: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { to: "/products", label: "Explore",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { to: "/wishlist", label: "Wishlist",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
  { to: "/orders",   label: "Orders",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
];

const Navbar = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { itemCount } = useSelector((s) => s.cart);
  const { user }  = useSelector((s) => s.auth);

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchVal,  setSearchVal]  = React.useState("");
  const [isDark,     setIsDark]     = React.useState(false);
  const inputRef = React.useRef(null);

  // Init theme
  React.useEffect(() => {
    const isDarkTheme =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkTheme);
    if (isDarkTheme) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(!isDark);
  };

  // Escape key closes search
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch  = () => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 60); };
  const closeSearch = () => { setSearchOpen(false); setSearchVal(""); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    closeSearch();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={closeSearch}>
          <div className={styles.searchBox} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className={styles.searchInput}
              />
              {searchVal && (
                <button type="button" className={styles.searchClear} onClick={() => setSearchVal("")}>✕</button>
              )}
            </form>
            <p className={styles.searchHint}>Enter to search · Esc to close</p>
          </div>
        </div>
      )}

      {/* ── Desktop Navbar ── */}
      <header className={styles.header}>
        <div className={styles.inner}>

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>Luminary</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className={styles.desktopNav}>
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
                {label}
                <span className={styles.navDot} />
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>

            {/* Theme Toggle */}
            <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle Theme">
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Search */}
            <button className={styles.iconBtn} onClick={openSearch} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Cart */}
            <button className={styles.cartBtn} onClick={() => dispatch(toggleCart())} aria-label="Cart">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>Cart</span>
              {itemCount > 0 && <span className={styles.cartCount}>{itemCount}</span>}
            </button>

            {/* User / Auth */}
            {user ? (
              <div className={styles.userMenu}>
                <Link to="/profile" className={styles.avatar}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : <span>{user.name[0].toUpperCase()}</span>}
                </Link>
                <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className={styles.mobileNav}>
        {NAV_LINKS.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `${styles.mobileTab} ${isActive ? styles.mobileTabActive : ""}`}>
            <span className={styles.mobileTabIcon}>{icon}</span>
            <span className={styles.mobileTabLabel}>{label}</span>
          </NavLink>
        ))}
        <button className={styles.mobileTab} onClick={() => dispatch(toggleCart())}>
          <span className={styles.mobileTabIcon}>
            <span className={styles.mobileCartWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && <span className={styles.mobileBadge}>{itemCount}</span>}
            </span>
          </span>
          <span className={styles.mobileTabLabel}>Cart</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;