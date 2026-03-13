import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../../products/services/product.api";
import ProductCard from "../../products/components/ProductCard";
import Loader from "../../../shared/components/Loader";
import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./HomePage.module.css";

const MOODS = [
  { label: "Minimal", emoji: "🤍", query: "minimal" },
  { label: "Party", emoji: "🎉", query: "party" },
  { label: "Casual", emoji: "☕", query: "casual" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(null);

  useEffect(() => {
    getProducts({ sort: "popular", limit: 6 })
      .then(({ data }) => setTrending(data.data.products))
      .finally(() => setLoading(false));
  }, []);

  const handleMood = (mood) => {
    setActiveMood(mood.label);
    navigate(`/products?search=${mood.query}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>NEW COLLECTION</span>
          <h1 className={styles.heroTitle}>Defined by Detail,<br />Refined by You</h1>
          <p className={styles.heroSub}>Curated premium products for every lifestyle</p>
          <Link to="/products" className={styles.heroBtn}>Shop Now →</Link>
        </div>
        <div className={styles.heroGradient} />
      </div>

      {/* Shop by Category */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <Link to="/products" className={styles.seeAll}>See all</Link>
        </div>
        <div className={styles.categoryGrid}>
          {[
            { name: "Watches", icon: "⌚", color: "#e8f3fe" },
            { name: "Audio", icon: "🎧", color: "#f0fdf4" },
            { name: "Shoes", icon: "👟", color: "#fff7ed" },
            { name: "Cameras", icon: "📷", color: "#fdf4ff" },
          ].map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name.toLowerCase()}`} className={styles.catCard} style={{ background: cat.color }}>
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mood Picker */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How are you feeling today?</h2>
        <p className={styles.sectionSub}>We'll match products to your mood</p>
        <div className={styles.moods}>
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              className={`${styles.moodBtn} ${activeMood === mood.label ? styles.moodActive : ""}`}
              onClick={() => handleMood(mood)}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Currently Trending</h2>
          <Link to="/products?sort=popular" className={styles.seeAll}>See all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className={styles.productGrid}>
            {trending.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <h3>Get exclusive deals</h3>
        <p>Subscribe for early access to new arrivals</p>
        <div className={styles.newsletterRow}>
          <input type="email" placeholder="your@email.com" />
          <button>Subscribe</button>
        </div>
      </section>

      <div style={{ height: "80px" }} />
    </div>
  );
};

export default HomePage;
