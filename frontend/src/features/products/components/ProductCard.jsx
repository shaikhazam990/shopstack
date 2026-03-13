import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, openCart } from "../../../store/cartSlice";
import { selectIsWishlisted } from "../../../store/wishlistSlice";
import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const image = product.images?.find((i) => i.isPrimary) || product.images?.[0];

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCart());
  };

  return (
    <Link to={`/products/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <img src={image?.url || "/placeholder.jpg"} alt={image?.alt || product.name} loading="lazy" />
        <button className={`${styles.heartBtn} ${isWishlisted ? styles.wishlisted : ""}`} onClick={(e) => e.preventDefault()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        <button className={styles.quickAdd} onClick={handleAddToCart}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Quick Add
        </button>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.bottom}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <div className={styles.rating}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>{product.ratings?.average || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
