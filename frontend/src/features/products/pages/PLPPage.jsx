import { useState } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Loader from "../../../shared/components/Loader";
import { SORT_OPTIONS } from "../../../shared/utils/constants";
import styles from "./PLPPage.module.css";

const FILTER_CHIPS = ["New Arrivals", "Best Sellers", "Sustainable", "Home Office", "Gift Ideas"];

const PLPPage = () => {
  const { products, total, loading, filters, updateFilter } = useProducts();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className={styles.chips}>
        <button className={`${styles.chip} ${styles.filterChip}`} onClick={() => setShowFilters(!showFilters)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters
        </button>
        {FILTER_CHIPS.map((chip) => (
          <button key={chip} className={styles.chip}>{chip}</button>
        ))}
      </div>

      {/* Sort + count */}
      <div className={styles.toolbar}>
        <span className={styles.count}>{total} products</span>
        <select className={styles.sort} value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <Loader />
      ) : (
        <div className={styles.grid}>
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className={styles.empty}>
          <p>No products found</p>
          <button onClick={() => updateFilter("search", "")}>Clear search</button>
        </div>
      )}
    </div>
  );
};

export default PLPPage;
