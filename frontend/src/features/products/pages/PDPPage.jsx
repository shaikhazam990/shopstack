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
  const [showAssistant, setShowAssistant] = useState(false);

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

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button className={styles.back} onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        {product.category?.name}
      </button>

      {/* Image */}
      <div className={styles.imageWrap}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <img src={product.images?.[selectedImage]?.url || "/placeholder.jpg"} alt={product.name} />
        {product.images?.length > 1 && (
          <div className={styles.dots}>
            {product.images.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === selectedImage ? styles.activeDot : ""}`} onClick={() => setSelectedImage(i)} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Viewers */}
        {product.viewCount > 0 && (
          <p className={styles.viewers}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {product.viewCount} people viewing now
          </p>
        )}

        {/* Title + price */}
        <h1 className={styles.name}>{product.name}</h1>
        <p className={styles.shortDesc}>{product.shortDescription || product.description?.slice(0, 80)}</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.comparePrice && <span className={styles.comparePrice}>{formatPrice(product.comparePrice)}</span>}
        </div>
        {product.comparePrice && (
          <p className={styles.emi}>Or {formatPrice((product.price / 12).toFixed(2))}/mo for 12 mo.</p>
        )}

        {/* Specs grid */}
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

        {/* Smart Assistant */}
        <div className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <p className={styles.assistantTitle}>Smart Assistant</p>
              <p className={styles.assistantSub}>Ask anything about this product</p>
            </div>
          </div>
          <AssistantChat productId={product._id} />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.saveBtn}>Save for later</button>
          <button className={styles.cartBtn} onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}>
            {product.stock === 0 ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDPPage;
