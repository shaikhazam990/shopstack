import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeCart, fetchCart, updateCartItem, removeCartItem, applyCoupon } from "../../../store/cartSlice";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import UpsellCard from "./UpsellCard";
import { formatPrice, freeShippingRemaining } from "../../../shared/utils/formatPrice";
import styles from "./CartDrawer.module.css";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pricing, upsells, isOpen, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isOpen && user) dispatch(fetchCart());
  }, [isOpen, user, dispatch]);

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate("/checkout");
  };

  if (!isOpen) return null;

  const remaining = freeShippingRemaining(pricing.subtotal);
  const progress = Math.min(100, ((pricing.subtotal) / 500) * 100);

  return (
    <>
      <div className={styles.overlay} onClick={() => dispatch(closeCart())} />
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            Your Cart
            <span className={styles.count}>{items.length} items</span>
          </div>
          <button className={styles.closeBtn} onClick={() => dispatch(closeCart())}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Free shipping progress */}
        <div className={styles.shippingBanner}>
          <div className={styles.shippingTop}>
            <span>Free shipping progress</span>
            {remaining > 0 ? (
              <span className={styles.shippingAmount}>{formatPrice(remaining)} away</span>
            ) : (
              <span className={styles.shippingFree}>🎉 Free shipping!</span>
            )}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          {remaining > 0 && (
            <p className={styles.shippingHint}>Add {formatPrice(remaining)} more to unlock free worldwide shipping</p>
          )}
        </div>

        {/* Items */}
        <div className={styles.items}>
          {loading ? (
            <p style={{ textAlign:"center", padding:"20px", color:"var(--text-secondary)" }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ textAlign:"center", padding:"40px", color:"var(--text-secondary)" }}>Your cart is empty</p>
          ) : (
            items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdate={(qty) => dispatch(updateCartItem({ itemId: item._id, quantity: qty }))}
                onRemove={() => dispatch(removeCartItem(item._id))}
              />
            ))
          )}
        </div>

        {/* AI Upsells — "Complete the Look" */}
        {upsells?.length > 0 && (
          <div className={styles.upsells}>
            <p className={styles.upsellTitle}>COMPLETE THE LOOK</p>
            {upsells.map((p) => <UpsellCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Summary + CTA */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(pricing.subtotal)}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span>{pricing.shipping === 0 ? <span style={{color:"var(--success)"}}>Free</span> : formatPrice(pricing.shipping)}</span></div>
            <div className={styles.totalRow}><span>Total</span><span>{formatPrice(pricing.total)}</span></div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Checkout Now →
            </button>
            <p className={styles.secure}>SECURE CHECKOUT POWERED BY STRIPE & PAYPAL</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
