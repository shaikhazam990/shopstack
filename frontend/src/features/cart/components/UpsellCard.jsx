import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/cartSlice";
import { formatPrice } from "../../../shared/utils/formatPrice";
import styles from "./UpsellCard.module.css";

const UpsellCard = ({ product }) => {
  const dispatch = useDispatch();
  const image = product.images?.[0]?.url;

  return (
    <div className={styles.card}>
      <img src={image || "/placeholder.jpg"} alt={product.name} className={styles.img} />
      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
      <button className={styles.addBtn} onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}>
        ADD
      </button>
    </div>
  );
};

export default UpsellCard;
