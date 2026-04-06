import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, openCart } from "../../../store/cartSlice";
import { fetchWishlists, toggleWishlistItem, selectIsWishlisted } from "../../../store/wishlistSlice";
import styles from "./PDPPage.module.css";

const PDPPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const folders  = useSelector((s) => s.wishlist.folders);
  const { user } = useSelector((s) => s.auth);

  const [product,    setProduct]   = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(null);
  const [activeImg,  setActiveImg] = useState(0);
  const [adding,     setAdding]    = useState(false);
  const [saving,     setSaving]    = useState(false);

  // Only fetch wishlist if user is logged in
  useEffect(() => { if (user) dispatch(fetchWishlists()); }, [dispatch, user]);

  // Derive wishlist state reactively
  const isWishlisted = useSelector(
    product ? selectIsWishlisted(product._id) : () => false
  );

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/products/${slug}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => setProduct(d.data?.product || d.data || d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCart());
    setTimeout(() => setAdding(false), 1500);
  };

  const handleSave = async () => {
    if (!product || saving) return;
    setSaving(true);
    const folderId = folders[0]?._id;
    if (folderId) {
      await dispatch(toggleWishlistItem({ folderId, productId: product._id }));
    }
    setSaving(false);
  };

  if (loading) return (
    <div className={styles.page}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", color:"rgba(255,255,255,0.2)", fontSize:14 }}>
        Loading…
      </div>
    </div>
  );
  if (error || !product) return (
    <div className={styles.page}>
      <p className={styles.error}>Product not found.</p>
    </div>
  );

  const images = product.images || [];
  const primaryIdx = images.findIndex(i => i.isPrimary);
  const orderedImgs = primaryIdx > 0
    ? [images[primaryIdx], ...images.filter((_, i) => i !== primaryIdx)]
    : images;

  const currentImg = orderedImgs[activeImg]?.url || orderedImgs[0]?.url;
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null;

  const stock = product.stock || 0;
  const stockStatus = stock === 0 ? "out" : stock < 10 ? "low" : "in";

  const specs = [
    { label: "Brand",    value: product.brand || "—" },
    { label: "SKU",      value: product.sku   || "—" },
    { label: "Weight",   value: product.weight ? `${product.weight}g` : "—" },
    { label: "Warranty", value: product.warranty || "—" },
    { label: "Shipping", value: product.shippingInfo || "Ships in 1–2 business days" },
    { label: "Return",   value: product.returnPolicy || "30 days return policy" },
  ];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        {product.category?.name || "Back"}
      </button>

      <div className={styles.layout}>

        {/* ── Gallery ── */}
        <div className={styles.gallery}>
          <div className={styles.imageWrap}>
            {product.badge && <span className={styles.badge}>{product.badge}</span>}
            <img src={currentImg} alt={product.name} />
          </div>

          {/* Desktop thumbnails */}
          {orderedImgs.length > 1 && (
            <div className={styles.thumbnails}>
              {orderedImgs.map((img, i) => (
                <div key={i} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}>
                  <img src={img.url} alt={`view ${i+1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Mobile dots */}
          {orderedImgs.length > 1 && (
            <div className={styles.dots}>
              {orderedImgs.map((_, i) => (
                <button key={i} className={`${styles.dot} ${i === activeImg ? styles.activeDot : ""}`}
                  onClick={() => setActiveImg(i)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className={styles.content}>

          {/* Live viewers */}
          <div className={styles.viewers}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {Math.floor(Math.random() * 9000 + 1000)}+ people viewing now
          </div>

          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>
              {"★".repeat(Math.round(product.ratings?.average || 4))}{"☆".repeat(5 - Math.round(product.ratings?.average || 4))}
            </span>
            <span className={styles.ratingCount}>
              {product.ratings?.average?.toFixed(1)} ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          <p className={styles.shortDesc}>{product.shortDescription || product.description?.slice(0, 180)}</p>

          <div className={styles.divider} />

          {/* Price */}
          <div>
            <div className={styles.priceRow}>
              <span className={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
              {product.comparePrice && (
                <span className={styles.comparePrice}>₹{product.comparePrice?.toLocaleString("en-IN")}</span>
              )}
              {discount && <span className={styles.discount}>{discount}% OFF</span>}
            </div>
            {product.price > 10000 && (
              <p className={styles.emi}>Or ₹{Math.round(product.price / 12).toLocaleString("en-IN")}/mo for 12 months</p>
            )}
          </div>

          {/* Specs */}
          <div className={styles.specsGrid}>
            {specs.map(({ label, value }) => (
              <div key={label} className={styles.specItem}>
                <span className={styles.specLabel}>{label}</span>
                <span className={styles.specValue}>{value}</span>
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className={styles.stockRow}>
            <span className={`${styles.stockDot} ${
              stockStatus === "low" ? styles.stockDotLow :
              stockStatus === "out" ? styles.stockDotOut : ""}`} />
            <span className={styles.stockText}>
              {stockStatus === "in"  && "In stock — ships within 24h"}
              {stockStatus === "low" && `Only ${stock} left — order soon`}
              {stockStatus === "out" && "Out of stock"}
            </span>
          </div>

          {/* CTA */}
          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "#a8d5a2" : "none"} stroke={isWishlisted ? "#a8d5a2" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              {isWishlisted ? "Saved" : "Save"}
            </button>
            <button className={styles.cartBtn} onClick={handleAddToCart}
              disabled={adding || stockStatus === "out"}>
              {adding ? "Added ✓" : stockStatus === "out" ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* AI Assistant Card */}
          <div className={styles.assistantCard}>
            <div className={styles.assistantHeader}>
              <div className={styles.assistantIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2"/><line x1="9" y1="11" x2="9" y2="13"/><line x1="15" y1="11" x2="15" y2="13"/></svg>
              </div>
              <div>
                <p className={styles.assistantTitle}>Smart Assistant</p>
                <p className={styles.assistantSub}>Ask anything about this product</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PDPPage;