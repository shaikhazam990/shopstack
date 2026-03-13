import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../../../store/cartSlice";
import useProducts from "../hooks/useProducts";
import Loader from "../../../shared/components/Loader";
import styles from "./PLPPage.module.css";

const CATEGORIES = ["All", "Smartphones", "Laptops", "Fragrances", "Skincare", "Furniture", "Tops", "Watches", "Sunglasses"];
const SORT_OPTIONS = [
  { label: "Featured", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Best Sellers", value: "popular" },
];

const PLPPage = () => {
  const dispatch = useDispatch();
  const { products, total, loading, filters, updateFilter } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const searchRef = useRef(null);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    updateFilter("category", cat === "All" ? "" : cat.toLowerCase());
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product._id);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCart());
    setTimeout(() => setAddingId(null), 1000);
  };

  const getImage = (p) => p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || "https://dummyjson.com/icon/100x100";

  return (
    <div className={styles.page}>

      {/* Hero Strip */}
      <div className={styles.heroStrip}>
        <p>FREE SHIPPING ON ORDERS OVER $500 · USE CODE <strong>LUMINARY20</strong> FOR 20% OFF</p>
      </div>

      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>All Products</h1>
        <p className={styles.subtitle}>{total} carefully curated items</p>
      </div>

      {/* Search */}
      <div className={styles.searchWrap} onClick={() => searchRef.current?.focus()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search products..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        {filters.search && (
          <button className={styles.clearSearch} onClick={() => updateFilter("search", "")}>✕</button>
        )}
      </div>

      {/* Category Pills */}
      <div className={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.catPill} ${activeCategory === cat ? styles.catActive : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.resultCount}>{loading ? "Loading..." : `${total} results`}</span>
        <div className={styles.sortWrap}>
          <span>Sort:</span>
          <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loaderWrap}><Loader /></div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◎</div>
          <p>No products found</p>
          <button onClick={() => { updateFilter("search", ""); setActiveCategory("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product, i) => (
            <Link
              key={product._id}
              to={`/products/${product.slug}`}
              className={styles.card}
              style={{ animationDelay: `${(i % 12) * 40}ms` }}
              onMouseEnter={() => setHoveredId(product._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className={styles.imageWrap}>
                {product.badge && <span className={styles.badge}>{product.badge}</span>}
                <img
                  src={getImage(product)}
                  alt={product.name}
                  className={styles.img}
                  loading="lazy"
                />
                {product.images?.length > 1 && (
                  <img
                    src={product.images[1]?.url}
                    alt={product.name}
                    className={`${styles.imgHover} ${hoveredId === product._id ? styles.imgHoverVisible : ""}`}
                    loading="lazy"
                  />
                )}

                {/* Quick add */}
                <button
                  className={`${styles.quickAdd} ${hoveredId === product._id ? styles.quickAddVisible : ""} ${addingId === product._id ? styles.quickAdded : ""}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  {addingId === product._id ? "✓ Added" : "Quick Add"}
                </button>
              </div>

              {/* Info */}
              <div className={styles.info}>
                <div className={styles.infoTop}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <div className={styles.rating}>
                    {"★".repeat(Math.round(product.ratings?.average || 0))}{"☆".repeat(5 - Math.round(product.ratings?.average || 0))}
                    <span>{product.ratings?.average?.toFixed(1)}</span>
                  </div>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>${product.price?.toFixed(2)}</span>
                  {product.comparePrice && (
                    <span className={styles.comparePrice}>${product.comparePrice?.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && products.length > 0 && products.length < total && (
        <div className={styles.loadMore}>
          <button onClick={() => updateFilter("page", (filters.page || 1) + 1)}>
            Load More <span>↓</span>
          </button>
          <p>{products.length} of {total} products</p>
        </div>
      )}

      <div style={{ height: "80px" }} />
    </div>
  );
};

export default PLPPage;