import styles from "./Loader.module.css";

const Loader = ({ size = 36, fullPage = false }) => (
  <div className={fullPage ? styles.fullPage : styles.inline}>
    <div className={styles.spinner} style={{ width: size, height: size }} />
  </div>
);

export default Loader;
