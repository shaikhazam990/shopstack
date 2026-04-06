import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { addToCart } from "../../../store/cartSlice";
import { openCart } from "../../../store/cartSlice";
import Loader from "../../../shared/components/Loader";
import DailySpin from "../components/DailySpin";
import styles from "./HomePage.module.css";


const FEATURED_CATEGORIES = [
  { name: "Smartphones", emoji: "📱", color: "#e8f0f7", tag: "Latest drops" },
  { name: "Laptops",     emoji: "💻", color: "#f0ede8", tag: "Work & create" },
  { name: "Fragrances",  emoji: "🌸", color: "#f7eef0", tag: "Smell amazing" },
  { name: "Furniture",   emoji: "🛋️", color: "#eef7f0", tag: "Your space" },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [addingId, setAddingId]   = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/products?sort=popular&limit=6`)
      .then(r => r.json())
      .then(d => setProducts(d.data?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    setAddingId(product._id);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCart());
    setTimeout(() => setAddingId(null), 1200);
  };

  const getImage = (p) => p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url;

  return (
    <div className={styles.page}>

      {/* Announcement */}
      <div className={styles.announcement}>
        <span>🌿</span>
        <p>Free shipping on orders over ₹40,000 · Easy 30-day returns</p>
        <span>🌿</span>
      </div>

      {/* Hero */}
      <section className={`${styles.hero} ${heroVisible ? styles.heroVisible : ""}`}>
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowDot} />
              New Collection — 2026
            </div>
            <h1 className={styles.heroTitle}>
              Defined
              <em>by Detail.</em>
            </h1>
            <p className={styles.heroBody}>
              Thoughtfully made products for people who care about quality, sustainability, and style.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/products" className={styles.heroPrimary}>
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/products?sort=newest" className={styles.heroSecondary}>New Arrivals →</Link>
            </div>
          </motion.div>

          <div className={styles.heroVisual}>
            <div className={styles.heroRing} />
            <div className={styles.heroRing2} />
            <div className={styles.heroOrb} />
            <div className={styles.heroCard}>
              <span>⭐ 4.9</span>
              <p>50k+ happy customers</p>
            </div>
            <div className={styles.heroCard2}>
              <strong>🚚 Free delivery</strong>
              <p>On orders over ₹40,000</p>
            </div>
          </div>
        </div>

        <div className={styles.heroStats}>
          {[["500+", "Products"], ["50k+", "Customers"], ["4.9★", "Avg Rating"], ["Free", "Returns"]].map(([val, label]) => (
            <div key={label} className={styles.stat}>
              <strong>{val}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gamification */}
      <DailySpin />

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
          </div>
          <Link to="/products" className={styles.seeAll}>See all →</Link>
        </div>
        <div className={styles.catGrid}>
          {FEATURED_CATEGORIES.map((cat, i) => (
            <Link key={cat.name} to={`/products?category=${cat.name.toLowerCase()}`}
              className={styles.catCard} style={{ animationDelay: `${i * 80}ms` }}>
              <span className={styles.catEmoji}>{cat.emoji}</span>
              <div>
                <p className={styles.catName}>{cat.name}</p>
                <p className={styles.catTag}>{cat.tag}</p>
              </div>
              <span className={styles.catArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Trending Now</h2>
            <p className={styles.sectionSub}>What everyone's adding to cart</p>
          </div>
          <Link to="/products?sort=popular" className={styles.seeAll}>See all →</Link>
        </div>
        {loading ? <Loader /> : (
          <div className={styles.productScroll}>
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/products/${product.slug}`} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                    <img src={getImage(product)} alt={product.name} className={styles.productImage} loading="lazy" />
                    <button className={styles.productQuickAdd} onClick={(e) => handleAddToCart(e, product)}>
                      {addingId === product._id ? "✓" : "+"}
                    </button>
                  </div>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.name}</p>
                    <div className={styles.productBottom}>
                      <span className={styles.productPrice}>₹{product.price?.toLocaleString("en-IN")}</span>
                      <span className={styles.productRating}>★ {product.ratings?.average?.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Value Props */}
      <div className={styles.valueProps}>
        {[
          { icon: "🚚", title: "Free Shipping", sub: "On orders over ₹40,000" },
          { icon: "↩️", title: "Easy Returns",  sub: "30-day return policy" },
          { icon: "🔒", title: "Secure Payment", sub: "256-bit encryption" },
          { icon: "💬", title: "24/7 Support",  sub: "Always here to help" },
        ].map(({ icon, title, sub }) => (
          <div key={title} className={styles.valueProp}>
            <span className={styles.valuePropIcon}>{icon}</span>
            <div>
              <p className={styles.valuePropTitle}>{title}</p>
              <p className={styles.valuePropSub}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <span className={styles.newsletterBadge}>Stay in the loop</span>
          <h3 className={styles.newsletterTitle}>Get early access to new drops</h3>
          <p className={styles.newsletterSub}>Join 50,000+ subscribers. No spam, ever.</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="your@email.com" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      <div style={{ height: "100px" }} />
    </div>
  );
};

export default HomePage;