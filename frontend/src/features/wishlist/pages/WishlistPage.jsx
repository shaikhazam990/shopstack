import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlists, createFolder, toggleWishlistItem } from "../../../store/wishlistSlice";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/utils/formatPrice";
import Loader from "../../../shared/components/Loader";
import styles from "./WishlistPage.module.css";

const FOLDER_ICONS = ["🛍️", "💻", "🏠", "💪", "🎂", "✈️", "🎮", "👗"];

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { folders, loading } = useSelector((s) => s.wishlist);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🛍️");

  useEffect(() => { dispatch(fetchWishlists()); }, [dispatch]);
  useEffect(() => { if (folders.length && !activeFolder) setActiveFolder(folders[0]?._id); }, [folders]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await dispatch(createFolder({ name: newName, icon: selectedIcon }));
    setNewName("");
    setShowCreate(false);
  };

  if (loading) return <Loader fullPage />;

  const currentFolder = folders.find((f) => f._id === activeFolder);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>My Wishlists</h1>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>+</button>
      </div>

      {/* Create folder modal */}
      {showCreate && (
        <div className={styles.createCard}>
          <h3>New Folder</h3>
          <div className={styles.iconRow}>
            {FOLDER_ICONS.map((icon) => (
              <button key={icon} className={`${styles.iconBtn} ${selectedIcon === icon ? styles.iconActive : ""}`} onClick={() => setSelectedIcon(icon)}>{icon}</button>
            ))}
          </div>
          <input className={styles.nameInput} placeholder="Folder name..." value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <div className={styles.createActions}>
            <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleCreate}>Create</button>
          </div>
        </div>
      )}

      {folders.length === 0 ? (
        <div className={styles.empty}>
          <p style={{ fontSize:"40px" }}>💛</p>
          <p>No wishlists yet</p>
          <button className={styles.createFirstBtn} onClick={() => setShowCreate(true)}>Create your first wishlist</button>
        </div>
      ) : (
        <>
          {/* Folder tabs */}
          <div className={styles.folderTabs}>
            {folders.map((folder) => (
              <button key={folder._id} className={`${styles.folderTab} ${activeFolder === folder._id ? styles.folderActive : ""}`} onClick={() => setActiveFolder(folder._id)}>
                <span>{folder.icon || "🛍️"}</span>
                <span>{folder.name}</span>
                <span className={styles.folderCount}>{folder.products?.length || 0}</span>
              </button>
            ))}
          </div>

          {/* Products in folder */}
          {currentFolder && (
            <div className={styles.products}>
              {currentFolder.products?.length === 0 ? (
                <p className={styles.emptyFolder}>This folder is empty. Browse products and tap ♥ to save.</p>
              ) : (
                currentFolder.products.map((product) => (
                  <div key={product._id || product} className={styles.productRow}>
                    <img src={product.images?.[0]?.url || "/placeholder.jpg"} alt={product.name} className={styles.productImg} />
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.name}</p>
                      <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                    </div>
                    <div className={styles.productActions}>
                      <Link to={`/products/${product.slug}`} className={styles.viewBtn}>View</Link>
                      <button className={styles.removeBtn} onClick={() => dispatch(toggleWishlistItem({ folderId: currentFolder._id, productId: product._id }))}>♥</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <div style={{ height: "80px" }} />
    </div>
  );
};

export default WishlistPage;
