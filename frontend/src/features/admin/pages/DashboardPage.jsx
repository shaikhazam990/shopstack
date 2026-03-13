import { useState, useEffect } from "react";
import apiClient from "../../../shared/utils/apiClient";
import Loader from "../../../shared/components/Loader";
import { formatPrice } from "../../../shared/utils/formatPrice";
import { ORDER_STATUS_COLORS } from "../../../shared/utils/constants";
import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/admin/dashboard").then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const { overview, recentOrders, topProducts } = stats;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Orders</p>
          <p className={styles.statValue}>{overview.totalOrders.toLocaleString()}</p>
          <span className={`${styles.statChange} ${overview.totalOrders.change > 0 ? styles.up : styles.down}`}>
            {overview.totalOrders.change > 0 ? "▲" : "▼"} {Math.abs(overview.totalOrders.change)}%
          </span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Revenue</p>
          <p className={styles.statValue}>{formatPrice(overview.revenue.value)}</p>
          <span className={`${styles.statChange} ${overview.revenue.change > 0 ? styles.up : styles.down}`}>
            {overview.revenue.change > 0 ? "▲" : "▼"} {Math.abs(overview.revenue.change)}%
          </span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Orders</p>
          <p className={styles.statValue}>{overview.activeOrders}</p>
          <span className={styles.statChange} style={{ color:"#64748b" }}>Live</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Avg. Delivery</p>
          <p className={styles.statValue}>{overview.avgDelivery} days</p>
          <span className={styles.statChange} style={{ color:"#64748b" }}>Stable</span>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent Orders</h2>
        <div className={styles.orderList}>
          {recentOrders.map((order) => (
            <div key={order._id} className={styles.orderRow}>
              <div>
                <p className={styles.orderNum}>{order.orderNumber}</p>
                <p className={styles.orderUser}>{order.user?.name}</p>
              </div>
              <div className={styles.orderRight}>
                <span className={styles.orderStatus} style={{ background: ORDER_STATUS_COLORS[order.status] + "20", color: ORDER_STATUS_COLORS[order.status] }}>
                  {order.status}
                </span>
                <p className={styles.orderAmount}>{formatPrice(order.pricing.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Top Products</h2>
        {topProducts.map((p, i) => (
          <div key={p._id} className={styles.productRow}>
            <span className={styles.rank}>{i + 1}</span>
            <img src={p.images?.[0]?.url || "/placeholder.jpg"} alt={p.name} className={styles.productImg} />
            <div className={styles.productInfo}>
              <p className={styles.productName}>{p.name}</p>
              <p className={styles.productSold}>{p.soldCount} sold</p>
            </div>
            <span className={styles.productPrice}>{formatPrice(p.price)}</span>
          </div>
        ))}
      </div>

      <div style={{ height: "80px" }} />
    </div>
  );
};

export default DashboardPage;
