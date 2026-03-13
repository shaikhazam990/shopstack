import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./CartItem.module.css";

const CartItem = ({ item, onUpdate, onRemove }) => {
  const image = item.product?.images?.[0]?.url;
  return (
    <div className={styles.item}>
      <img src={image || "/placeholder.jpg"} alt={item.product?.name} className={styles.img} />
      <div className={styles.info}>
        <p className={styles.name}>{item.product?.name || item.name}</p>
        {item.variant?.value && <p className={styles.variant}>{item.variant.value}</p>}
        <div className={styles.bottom}>
          <div className={styles.qty}>
            <button onClick={() => onUpdate(item.quantity - 1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => onUpdate(item.quantity + 1)}>+</button>
          </div>
          <button className={styles.remove} onClick={onRemove}>Remove</button>
        </div>
      </div>
      <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
    </div>
  );
};

export default CartItem;
