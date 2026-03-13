import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/order.api";
import Loader from "../../../shared/components/Loader";
import { formatPrice } from "../../../shared/utils/formatPrice";
import { ORDER_STATUS_COLORS } from "../../../shared/utils/constants";
import styles from "./OrdersPage.module.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(({ data }) => setOrders(data.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Orders</h1>
      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>No orders yet</p>
          <Link to="/products" className={styles.shopBtn}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.orderNum}>{order.orderNumber}</p>
                  <p className={styles.date}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={styles.statusBadge} style={{ background: ORDER_STATUS_COLORS[order.status] + "20", color: ORDER_STATUS_COLORS[order.status] }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className={styles.itemImages}>
                {order.items.slice(0, 3).map((item) => (
                  <img key={item._id} src={item.image || "/placeholder.jpg"} alt={item.name} className={styles.itemImg} />
                ))}
                {order.items.length > 3 && <div className={styles.more}>+{order.items.length - 3}</div>}
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.itemCount}>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                <span className={styles.total}>{formatPrice(order.pricing.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ height: "80px" }} />
    </div>
  );
};

export default OrdersPage;
