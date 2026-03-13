import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getOrder } from "../services/order.api";
import useSocket from "../../../shared/hooks/useSocket";
import Loader from "../../../shared/components/Loader";
import { formatPrice } from "../../../shared/utils/formatPrice";
import { ORDER_STATUS_COLORS } from "../../../shared/utils/constants";
import styles from "./OrderDetailPage.module.css";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false));
  }, [id]);

  const socket = useSocket({
    "order:update": (data) => {
      if (data._id === id) setOrder((prev) => ({ ...prev, ...data }));
    },
  });

  useEffect(() => {
    if (id) socket.emit("join:order", id);
  }, [id, socket]);

  if (loading) return <Loader fullPage />;
  if (!order) return <div style={{ padding: "40px", textAlign: "center" }}>Order not found</div>;

  const statusIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className={styles.page}>
      {isSuccess && (
        <div className={styles.successBanner}>
          🎉 Order placed successfully! Confirmation email sent.
        </div>
      )}

      <button className={styles.back} onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Orders
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.orderNum}>{order.orderNumber}</h1>
          <p className={styles.date}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <span className={styles.status} style={{ background: ORDER_STATUS_COLORS[order.status] + "20", color: ORDER_STATUS_COLORS[order.status] }}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Tracking timeline */}
      {!["cancelled", "refunded"].includes(order.status) && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Tracking</h2>
          <div className={styles.timeline}>
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className={`${styles.timelineStep} ${i <= statusIdx ? styles.done : ""}`}>
                <div className={styles.timelineDot}>
                  {i < statusIdx ? "✓" : i === statusIdx ? "●" : ""}
                </div>
                <span className={styles.timelineLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`${styles.timelineLine} ${i < statusIdx ? styles.doneLine : ""}`} />}
              </div>
            ))}
          </div>
          {order.tracking?.estimatedDelivery && (
            <p className={styles.estDelivery}>
              Estimated delivery: <strong>{new Date(order.tracking.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</strong>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Items ({order.items.length})</h2>
        {order.items.map((item) => (
          <div key={item._id} className={styles.item}>
            <img src={item.image || "/placeholder.jpg"} alt={item.name} className={styles.itemImg} />
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemQty}>Qty: {item.quantity}</p>
            </div>
            <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Order Summary</h2>
        <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(order.pricing.subtotal)}</span></div>
        <div className={styles.summaryRow}><span>Shipping</span><span>{order.pricing.shipping === 0 ? "Free" : formatPrice(order.pricing.shipping)}</span></div>
        {order.pricing.tax > 0 && <div className={styles.summaryRow}><span>Tax</span><span>{formatPrice(order.pricing.tax)}</span></div>}
        <div className={styles.summaryTotal}><span>Total</span><span>{formatPrice(order.pricing.total)}</span></div>
      </div>

      <div style={{ height: "80px" }} />
    </div>
  );
};

export default OrderDetailPage;
