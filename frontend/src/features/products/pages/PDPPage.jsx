import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProduct } from "../services/product.api";
import { addToCart, openCart } from "../../../store/cartSlice";
import AssistantChat from "../../ai-assistant/components/AssistantChat";
import Loader from "../../../shared/components/Loader";
import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./PDPPage.module.css";

const PDPPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(({ data }) => { setProduct(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1, variant: selectedVariant }));
    dispatch(openCart());
    setAddingToCart(false);
  };

  if (loading) return <Loader fullPage />;
  if (!product) return <div className={styles.error}>Product not found</div>;

  const discountPct = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const stockStatus = product.stock === 0
    ? "out"
    : product.stock <= (product.lowStockThreshold || 5)
    ? "low"
    : "in";

  return (
    <div className={styles.page}>

      {/* Back */}
      <button className={styles.back} onClick={() => window.history.back()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        {product.category?.name || "Back"}
      </button>

      {/* Two-column layout */}
      <div className={styles.layout}>

        {/* ── Left: Gallery ── */}
        <div className={styles.gallery}>
          <div className={styles.imageWrap}>
            {product.badge && <span className={styles.badge}>{product.badge}</span>}
            <img
              src={product.images?.[selectedImage]?.url || "/placeholder.jpg"}
              alt={product.name}
            />
          </div>

          {/* Thumbnails (desktop) */}
          {product.images?.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ""}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img.url} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Dots (mobile) */}
          {product.images?.length > 1 && (
            <div className={styles.dots}>
              {product.images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === selectedImage ? styles.activeDot : ""}`}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Content ── */}
        <div className={styles.content}>

          {/* Viewers */}
          {product.viewCount > 10 && (
            <p className={styles.viewers}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {product.viewCount}+ people viewing now
            </p>
          )}

          {/* Title */}
          <h1 className={styles.name}>{product.name}</h1>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className={styles.ratingRow}>
              <span className={styles.stars}>
                {"★".repeat(Math.round(product.ratings.average))}
                {"☆".repeat(5 - Math.round(product.ratings.average))}
              </span>
              <span className={styles.ratingCount}>
                {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
              </span>
            </div>
          )}

          {/* Short Description */}
          <p className={styles.shortDesc}>
            {product.shortDescription || product.description?.slice(0, 120)}
          </p>

          <div className={styles.divider} />

          {/* Price */}
          <div>
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className={styles.comparePrice}>{formatPrice(product.comparePrice)}</span>
              )}
              {discountPct && (
                <span className={styles.discount}>{discountPct}% OFF</span>
              )}
            </div>
            {product.comparePrice && (
              <p className={styles.emi}>
                Or {formatPrice((product.price / 12).toFixed(2))}/mo for 12 months
              </p>
            )}
          </div>

          <div className={styles.divider} />

          {/* Specs */}
          {product.specs?.length > 0 && (
            <div className={styles.specsGrid}>
              {product.specs.map((spec) => (
                <div key={spec.label} className={styles.specItem}>
                  <span className={styles.specLabel}>{spec.label}</span>
                  <span className={styles.specValue}>{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className={styles.stockRow}>
            <span className={`${styles.stockDot} ${stockStatus === "low" ? styles.stockDotLow : stockStatus === "out" ? styles.stockDotOut : ""}`} />
            <span className={styles.stockText}>
              {stockStatus === "out"
                ? "Out of stock"
                : stockStatus === "low"
                ? `Only ${product.stock} left in stock`
                : "In stock — ships within 24h"}
            </span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.saveBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Save
            </button>
            <button
              className={styles.cartBtn}
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
            >
              {product.stock === 0
                ? "Out of Stock"
                : addingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>
          </div>

          {/* AI Assistant */}
          <div className={styles.assistantCard}>
            <div className={styles.assistantHeader}>
              <div className={styles.assistantIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div>
                <p className={styles.assistantTitle}>Smart Assistant</p>
                <p className={styles.assistantSub}>Ask anything about this product</p>
              </div>
            </div>
            <AssistantChat productId={product._id} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PDPPage;