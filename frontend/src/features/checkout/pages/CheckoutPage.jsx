import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../shared/utils/apiClient";
import { fetchCart } from "../../../store/cartSlice";
import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, pricing } = useSelector((s) => s.cart);
  const [step, setStep] = useState(1); // 1=shipping, 2=payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", country: "IN",
  });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });

  const handleShippingChange = (e) => setShipping((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create payment intent
      const { data: pi } = await apiClient.post("/orders/payment-intent", { amount: pricing.total });

      // 2. Place order (in production, confirm Stripe here first)
      const { data } = await apiClient.post("/orders", {
        shippingAddress: shipping,
        payment: { method: "stripe", stripePaymentIntentId: pi.clientSecret },
      });

      await dispatch(fetchCart());
      navigate(`/orders/${data.data._id}?success=true`);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => (step === 2 ? setStep(1) : navigate(-1))}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        {step === 2 ? "Shipping" : "Cart"}
      </button>

      <h1 className={styles.title}>Checkout</h1>

      {/* Steps indicator */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
          <div className={styles.stepDot}>1</div><span>Shipping</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
          <div className={styles.stepDot}>2</div><span>Payment</span>
        </div>
      </div>

      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Shipping Details</h2>
          <div className={styles.form}>
            {[
              { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { name: "fullName", label: "Full Name", placeholder: "John Doe" },
              { name: "phone", label: "Phone", type: "tel", placeholder: "+91 9000000000" },
              { name: "line1", label: "Address", placeholder: "123 Street, Area" },
              { name: "line2", label: "Apartment/Suite (optional)", placeholder: "Apt 4B" },
            ].map(({ name, label, type = "text", placeholder }) => (
              <div key={name} className={styles.field}>
                <label>{label}</label>
                <input type={type} name={name} value={shipping[name]} onChange={handleShippingChange} placeholder={placeholder} />
              </div>
            ))}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>City</label>
                <input name="city" value={shipping.city} onChange={handleShippingChange} placeholder="Mumbai" />
              </div>
              <div className={styles.field}>
                <label>ZIP</label>
                <input name="zip" value={shipping.zip} onChange={handleShippingChange} placeholder="400001" />
              </div>
            </div>

            {/* Smart Delivery Estimator */}
            {shipping.city && (
              <div className={styles.estimator}>
                <div className={styles.estimatorIcon}>📦</div>
                <div>
                  <p className={styles.estimatorTitle}>Smart Delivery Estimate</p>
                  <p className={styles.estimatorDate}>Based on <strong>{shipping.city}</strong> — expect delivery by <strong>Thursday, within 3-5 days</strong></p>
                </div>
              </div>
            )}
          </div>
          <button className={styles.nextBtn} onClick={() => setStep(2)} disabled={!shipping.fullName || !shipping.email || !shipping.line1 || !shipping.city}>
            Continue to Payment →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Secure Payment
          </h2>
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Card Number</label>
              <input value={card.number} onChange={(e) => setCard((p) => ({ ...p, number: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Expiry</label>
                <input value={card.expiry} onChange={(e) => setCard((p) => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" maxLength={5} />
              </div>
              <div className={styles.field}>
                <label>CVC</label>
                <input value={card.cvc} onChange={(e) => setCard((p) => ({ ...p, cvc: e.target.value }))} placeholder="123" maxLength={3} type="password" />
              </div>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {/* Order summary */}
          <div className={styles.orderSummary}>
            {items.map((item) => (
              <div key={item._id} className={styles.summaryItem}>
                <img src={item.product?.images?.[0]?.url || "/placeholder.jpg"} alt={item.product?.name} />
                <span className={styles.summaryName}>{item.product?.name}</span>
                <span className={styles.summaryPrice}>{formatPrice(item.price)}</span>
              </div>
            ))}
            <div className={styles.divider} />
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(pricing.subtotal)}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span>{pricing.shipping === 0 ? "Free" : formatPrice(pricing.shipping)}</span></div>
            <div className={styles.summaryTotal}><span>Total</span><span>{formatPrice(pricing.total)}</span></div>
          </div>

          <button className={styles.payBtn} onClick={handlePlaceOrder} disabled={loading || !card.number}>
            {loading ? "Processing..." : `Pay ${formatPrice(pricing.total)} →`}
          </button>
          <p className={styles.secureNote}>🔒 256-bit SSL encrypted • Powered by Stripe</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
